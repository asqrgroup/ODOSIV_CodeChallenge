"""Local raw data streaming utility."""

from __future__ import annotations

import json
import logging
import time
from collections import deque
from pathlib import Path
from typing import Deque, Dict, Iterator, Tuple

import psycopg
from psycopg.types.json import Json

APP_DSN = "dbname=appdb user=appuser password=secret host=localhost port=5432"
BASE_DIR = Path(__file__).resolve().parent / "pmdata"
PEOPLE = [f"p{str(i).zfill(2)}" for i in range(1, 17)]
SLEEP_SECONDS = 0.5


def ensure_raw_data_table(conn: psycopg.Connection) -> None:
    """Ensure the raw_data table exists with the expected schema."""
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS raw_data (
                id BIGSERIAL PRIMARY KEY,
                json_data JSONB NOT NULL,
                ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )


def load_records_for_person(person: str) -> Iterator[dict]:
    """Yield JSON payloads for a single person."""
    file_path = BASE_DIR / person / "fitbit" / "heart_rate.json"
    with open(file_path, "r", encoding="utf-8") as handle:
        records = json.load(handle)

    for record in records:
        yield {
            "person_id": person,
            "dateTime": record.get("dateTime"),
            "value": record.get("value", {}),
        }


def build_stream_queue() -> Deque[Tuple[str, Iterator[dict]]]:
    """Prepare a round-robin queue of iterators, skipping missing or invalid files."""
    queue: Deque[Tuple[str, Iterator[dict]]] = deque()

    for person in PEOPLE:
        file_path = BASE_DIR / person / "fitbit" / "heart_rate.json"
        if not file_path.exists():
            logging.warning("Skipping %s - missing file at %s", person, file_path)
            continue

        try:
            iterator = load_records_for_person(person)
            # Prime the generator by peeking to catch JSON issues early.
            peek = next(iterator)
        except StopIteration:
            logging.warning("Skipping %s - no data in %s", person, file_path)
            continue
        except json.JSONDecodeError as exc:
            logging.error("Skipping %s - invalid JSON (%s)", person, exc)
            continue

        # Rebuild iterator with the peeked record included.
        def prepend_first(first_item: dict, rest_iter: Iterator[dict]) -> Iterator[dict]:
            yield first_item
            for item in rest_iter:
                yield item

        queue.append((person, prepend_first(peek, iterator)))

    return queue


def stream_raw_data() -> None:
    """Stream records into raw_data table, alternating between persons."""
    queue = build_stream_queue()
    if not queue:
        logging.error("No data available to stream from %s", BASE_DIR)
        return

    counters: Dict[str, int] = {person: 0 for person, _ in queue}

    with psycopg.connect(APP_DSN) as conn:
        conn.autocommit = True
        ensure_raw_data_table(conn)

        with conn.cursor() as cur:
            while queue:
                person, iterator = queue.popleft()
                try:
                    record = next(iterator)
                except StopIteration:
                    logging.info("Finished streaming %s", person)
                    continue

                counters[person] = counters.get(person, 0) + 1
                logging.info(
                    "Streaming %s entry #%d: %s",
                    person,
                    counters[person],
                    record,
                )

                cur.execute(
                    "INSERT INTO raw_data (json_data) VALUES (%s)",
                    (Json(record),),
                )

                queue.append((person, iterator))
                time.sleep(SLEEP_SECONDS)

    logging.info("Raw data streaming complete.")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    try:
        stream_raw_data()
    except Exception:  # pragma: no cover - runtime diagnostics
        logging.exception("Streaming failed")
        raise
