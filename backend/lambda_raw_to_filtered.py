from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from psycopg.types.json import Json

APP_DSN = ("dbname=testdb user=appuser password=secret host=localhost port=5432")


logger = logging.getLogger(__name__)

def lambda_handler(event: Optional[Dict[str, Any]], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda entry point. Moves batches of heart rate data from raw_data to filtered_data.
    """
    logger.info("lambda_raw_to_filtered invocation started.")
    logger.debug("Invocation payload: event=%s context=%s", event, context)

    summary: Dict[str, Any] = {
        "raw_count": 0,
        "filtered_count": 0,
        "row_balance": 0,
        "target_batch": 0,
        "moved_rows": 0,
        "skipped_rows": 0,
        "duplicate_rows": 0,
        "offset": 0,
        "logged_errors": 0,
        "iterations": 0,
        "total_attempted": 0,
        "total_valid_rows": 0,
    }

    try:
        logger.info("Opening database connection.")
        with psycopg.connect(APP_DSN) as conn:
            logger.info("Database connection established.")
            with conn.cursor(row_factory=dict_row) as cur:
                _ensure_tables(cur)
                logger.debug("Ensured required tables exist.")

                raw_count = _get_table_count(cur, "raw_data")
                filtered_count = _get_table_count(cur, "filtered_data")
                row_balance = raw_count - filtered_count

                summary.update(
                    {
                        "raw_count": raw_count,
                        "filtered_count": filtered_count,
                        "row_balance": row_balance,
                    }
                )

                logger.info(
                    "Row counts retrieved: raw=%s filtered=%s balance=%s",
                    raw_count,
                    filtered_count,
                    row_balance,
                )

                if row_balance < 0:
                    logger.error(
                        "Row balance is negative. Skipping transfer. raw=%s filtered=%s",
                        raw_count,
                        filtered_count,
                    )
                    _log_event(
                        cur,
                        level="error",
                        message="Filtered data row count exceeds raw data row count.",
                        details={
                            "raw_count": raw_count,
                            "filtered_count": filtered_count,
                            "row_balance": row_balance,
                        },
                    )
                    return summary

                initial_row_balance = row_balance
                summary["initial_row_balance"] = initial_row_balance
                total_attempted = 0
                total_valid = 0
                total_inserted = 0
                total_skipped = 0
                total_duplicates = 0
                total_logged_errors = 0
                iterations = 0
                source_offset_start = filtered_count

                while row_balance > 0:
                    batch_size = _determine_batch_size(row_balance)
                    summary["target_batch"] = batch_size
                    logger.info(
                        "Determined batch size for iteration %s: %s",
                        iterations + 1,
                        batch_size,
                    )

                    if batch_size == 0:
                        logger.info("Batch size returned 0; exiting loop.")
                        break

                    stage_stats = _stage_and_insert_batch(
                        cur, batch_size, source_offset_start + total_attempted
                    )
                    attempted = stage_stats["total_considered"]
                    valid_rows = stage_stats["valid_rows"]
                    inserted = stage_stats["inserted"]
                    skipped = stage_stats["skipped"]
                    duplicates = stage_stats["duplicates"]
                    logged_errors = stage_stats["logged_errors"]

                    iterations += 1
                    total_attempted += attempted
                    total_valid += valid_rows
                    total_inserted += inserted
                    total_skipped += skipped
                    total_duplicates += duplicates
                    total_logged_errors += logged_errors

                    if attempted == 0 and inserted == 0:
                        logger.info(
                            "Iteration %s yielded no new rows (offset %s); stopping.",
                            iterations,
                            stage_stats["offset"],
                        )
                        break

                    filtered_count += inserted
                    summary["filtered_count"] = filtered_count

                    row_balance = raw_count - filtered_count
                    summary["row_balance_after"] = row_balance

                    logger.info(
                        "Iteration %s complete. attempted=%s valid=%s inserted=%s skipped=%s duplicates=%s logged_errors=%s remaining_balance=%s",
                        iterations,
                        attempted,
                        valid_rows,
                        inserted,
                        skipped,
                        duplicates,
                        logged_errors,
                        row_balance,
                    )

                    if row_balance <= 0:
                        break

                summary["moved_rows"] = total_inserted
                summary["skipped_rows"] = total_skipped
                summary["duplicate_rows"] = total_duplicates
                summary["logged_errors"] = total_logged_errors
                summary["offset"] = source_offset_start + total_attempted
                summary["iterations"] = iterations
                summary["total_attempted"] = total_attempted
                summary["total_valid_rows"] = total_valid
                summary["row_balance_after"] = row_balance

                _log_event(
                    cur,
                    level="info",
                    message="Batch move completed.",
                    details={
                        "iterations": iterations,
                        "requested_batch_last": summary["target_batch"],
                        "attempted_total": total_attempted,
                        "valid_rows_total": total_valid,
                        "inserted_total": total_inserted,
                        "skipped_total": total_skipped,
                        "duplicates_total": total_duplicates,
                        "source_offset_start": source_offset_start,
                        "source_offset_end": summary["offset"],
                        "logged_errors_total": total_logged_errors,
                        "row_balance_before": initial_row_balance,
                        "row_balance_after": row_balance,
                    },
                )

        return summary

    except Exception as exc:
        logger.exception("lambda_raw_to_filtered execution failed: %s", exc)
        logging.exception("lambda_raw_to_filtered execution failed.")
        try:
            with psycopg.connect(APP_DSN) as conn, conn.cursor() as cur:
                _log_event(
                    cur,
                    level="error",
                    message="Unhandled exception in lambda_raw_to_filtered.",
                    details={"error": str(exc)},
                )
        except Exception:
            # Suppress logging errors during exception handling.
            pass
        raise


def _ensure_tables(cur: psycopg.Cursor) -> None:
    logger.debug("Ensuring filtered_data table exists.")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS filtered_data (
            person_id  VARCHAR(5) NOT NULL,
            date_time  TIMESTAMP NOT NULL,
            bpm        INTEGER NOT NULL,
            confidence INTEGER NOT NULL,
            ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (person_id, date_time)
        )
        """
    )
    logger.debug("Ensuring log_raw_to_filt table exists.")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS log_raw_to_filt (
            id BIGSERIAL PRIMARY KEY,
            json_data JSONB NOT NULL,
            ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )


# def _get_table_count(cur: psycopg.Cursor, table_name: str) -> int:
#     query = sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table_name))
#     cur.execute(query)
#     result = cur.fetchone()
#     return int(result[0]) if result else 0

def _get_table_count(cur: psycopg.Cursor, table_name: str) -> int:
    query = sql.SQL("SELECT COUNT(*) AS cnt FROM {}").format(sql.Identifier(table_name))
    cur.execute(query)
    row = cur.fetchone()  # dict like {"cnt": 123}
    logger.debug("Count query for %s returned %s", table_name, row)
    return int(row["cnt"]) if row and row.get("cnt") is not None else 0

def _determine_batch_size(row_balance: int) -> int:
    if row_balance <= 0:
        return 0
    if row_balance > 100_000:
        logger.debug("Row balance %s > 100000; selecting batch size 100000.", row_balance)
        return 100_000
    if row_balance >= 10_000:
        logger.debug("Row balance %s >= 10000; selecting batch size 10000.", row_balance)
        return 10_000
    logger.debug("Row balance %s < 10000; selecting batch size %s.", row_balance, row_balance)
    return row_balance


def _stage_and_insert_batch(
    cur: psycopg.Cursor, batch_size: int, offset: int
) -> Dict[str, int]:
    logger.debug(
        "Starting SQL-based staging for up to %s rows with offset %s.",
        batch_size,
        offset,
    )

    offset = max(offset, 0)

    cur.execute("DROP TABLE IF EXISTS filtered_stage")
    cur.execute(
        """
        CREATE TEMP TABLE filtered_stage (
            person_id VARCHAR(5),
            date_time TIMESTAMP,
            bpm INTEGER,
            confidence INTEGER
        ) ON COMMIT DROP
        """
    )

    cur.execute(
        r"""
        WITH candidate AS (
            SELECT id, json_data
            FROM raw_data
            ORDER BY id
            OFFSET %s
            LIMIT %s
        ),
        normalized AS (
            SELECT
                id,
                json_data,
                jsonb_typeof(json_data) AS json_type,
                CASE
                    WHEN jsonb_typeof(json_data) = 'object'
                        THEN json_data ?& ARRAY['value', 'dateTime', 'person_id']
                    ELSE FALSE
                END AS has_required_top_level,
                CASE
                    WHEN jsonb_typeof(json_data) = 'object'
                        THEN json_data - 'value' - 'dateTime' - 'person_id'
                    ELSE NULL
                END AS extra_top_level,
                json_data -> 'value' AS value_obj,
                jsonb_typeof(json_data -> 'value') AS value_type,
                CASE
                    WHEN jsonb_typeof(json_data -> 'value') = 'object'
                        THEN (json_data -> 'value') ?& ARRAY['bpm', 'confidence']
                    ELSE FALSE
                END AS has_required_value_keys,
                CASE
                    WHEN jsonb_typeof(json_data -> 'value') = 'object'
                        THEN (json_data -> 'value') - 'bpm' - 'confidence'
                    ELSE NULL
                END AS extra_value_keys,
                json_data ->> 'person_id' AS person_id,
                json_data ->> 'dateTime' AS raw_date_time,
                json_data -> 'value' ->> 'bpm' AS bpm_text,
                json_data -> 'value' ->> 'confidence' AS confidence_text,
                CASE
                    WHEN json_data ->> 'dateTime' IS NULL THEN NULL
                    WHEN (json_data ->> 'dateTime') ~ '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$'
                        THEN (json_data ->> 'dateTime')::timestamp
                    WHEN (json_data ->> 'dateTime') ~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$'
                        THEN (replace(replace(json_data ->> 'dateTime', 'T', ' '), 'Z', '+00:00'))::timestamptz AT TIME ZONE 'UTC'
                    WHEN (json_data ->> 'dateTime') ~ '^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}\+00:00$'
                        THEN (replace(json_data ->> 'dateTime', 'T', ' '))::timestamptz AT TIME ZONE 'UTC'
                    ELSE NULL
                END AS parsed_date_time
            FROM candidate
        ),
        validated AS (
            SELECT
                n.*,
                (
                    json_type = 'object'
                    AND has_required_top_level
                    AND COALESCE(extra_top_level, '{}'::jsonb) = '{}'::jsonb
                    AND value_type = 'object'
                    AND has_required_value_keys
                    AND COALESCE(extra_value_keys, '{}'::jsonb) = '{}'::jsonb
                    AND person_id IS NOT NULL
                    AND person_id <> ''
                    AND raw_date_time IS NOT NULL
                    AND parsed_date_time IS NOT NULL
                    AND bpm_text ~ '^\-?\d+$'
                    AND confidence_text ~ '^\-?\d+$'
                ) AS is_valid,
                CASE
                    WHEN json_type <> 'object' THEN 'json_data is not an object'
                    WHEN NOT has_required_top_level THEN 'Missing top-level keys in json_data'
                    WHEN COALESCE(extra_top_level, '{}'::jsonb) <> '{}'::jsonb THEN 'Unexpected top-level keys in json_data'
                    WHEN value_type <> 'object' THEN 'json_data.value is not an object'
                    WHEN NOT has_required_value_keys THEN 'Missing keys inside json_data.value'
                    WHEN COALESCE(extra_value_keys, '{}'::jsonb) <> '{}'::jsonb THEN 'Unexpected keys inside json_data.value'
                    WHEN person_id IS NULL OR person_id = '' THEN 'person_id is missing or not a string'
                    WHEN raw_date_time IS NULL THEN 'dateTime is missing'
                    WHEN parsed_date_time IS NULL THEN 'dateTime could not be parsed'
                    WHEN bpm_text IS NULL OR bpm_text !~ '^\-?\d+$' THEN 'bpm is not an integer'
                    WHEN confidence_text IS NULL OR confidence_text !~ '^\-?\d+$' THEN 'confidence is not an integer'
                    ELSE 'Unknown validation error'
                END AS failure_reason
            FROM normalized n
        ),
        staged AS (
            INSERT INTO filtered_stage (person_id, date_time, bpm, confidence)
            SELECT person_id, parsed_date_time, bpm_text::int, confidence_text::int
            FROM validated
            WHERE is_valid
            RETURNING 1
        )
        SELECT
            (SELECT COUNT(*) FROM validated) AS total_considered,
            (SELECT COUNT(*) FROM validated WHERE is_valid) AS valid_count,
            (SELECT COUNT(*) FROM staged) AS staged_count,
            COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'raw_id', id,
                            'raw_json', json_data,
                            'reason', failure_reason
                        )
                    )
                    FROM validated
                    WHERE NOT is_valid
                ),
                '[]'::json
            ) AS invalid_rows
        """,
        (offset, batch_size),
    )

    stats = cur.fetchone()
    if not stats:
        logger.debug(
            "SQL staging returned no rows for offset %s and batch size %s.",
            offset,
            batch_size,
        )
        cur.execute("DROP TABLE IF EXISTS filtered_stage")
        return {
            "total_considered": 0,
            "valid_rows": 0,
            "inserted": 0,
            "duplicates": 0,
            "skipped": 0,
            "offset": offset,
            "logged_errors": 0,
        }

    total_considered = int(stats.get("total_considered") or 0)
    valid_rows = int(stats.get("valid_count") or 0)
    staged_rows = int(stats.get("staged_count") or 0)
    invalid_rows = stats.get("invalid_rows") or []
    logged_errors = len(invalid_rows)

    logger.debug(
        "SQL staging complete. total=%s valid=%s staged=%s invalid=%s offset=%s",
        total_considered,
        valid_rows,
        staged_rows,
        len(invalid_rows),
        offset,
    )

    if invalid_rows:
        for invalid in invalid_rows:
            _log_event(
                cur,
                level="error",
                message=invalid.get("reason", "Invalid json_data in raw_data."),
                details=invalid,
            )

    inserted = 0
    duplicates = 0
    if staged_rows:
        logger.debug("Inserting staged rows into filtered_data.")
        cur.execute(
            """
            INSERT INTO filtered_data (person_id, date_time, bpm, confidence)
            SELECT person_id, date_time, bpm, confidence
            FROM filtered_stage
            ON CONFLICT (person_id, date_time) DO NOTHING
            """
        )
        inserted = cur.rowcount or 0
        duplicates = max(staged_rows - inserted, 0)
        logger.debug(
            "Filtered insert complete. inserted=%s duplicates=%s", inserted, duplicates
        )
    else:
        logger.debug("No valid rows staged for insertion.")

    cur.execute("DROP TABLE IF EXISTS filtered_stage")

    return {
        "total_considered": total_considered,
        "valid_rows": valid_rows,
        "inserted": inserted,
        "duplicates": duplicates,
        "skipped": total_considered - valid_rows,
        "offset": offset,
        "logged_errors": logged_errors,
    }


def _log_event(
    cur: psycopg.Cursor,
    *,
    level: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
) -> None:
    payload: Dict[str, Any] = {"level": level, "message": message}
    if details:
        payload.update(details)

    cur.execute(
        """
        INSERT INTO log_raw_to_filt (json_data)
        VALUES (%s)
        """,
        (Json(payload),),
    )
    logger.debug("Logged event to log_raw_to_filt: level=%s message=%s", level, message)


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Run lambda_raw_to_filtered locally.")
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable DEBUG level logging.",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    logger.info("Running locally... verbose=%s", args.verbose)
    try:
        result = lambda_handler({}, None)
        print(json.dumps(result, indent=2, default=str))
    except Exception:
        logging.exception("Local run failed")
