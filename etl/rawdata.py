import json
import sys
from pathlib import Path

import psycopg
from psycopg.types.json import Json

APP_DSN = "dbname=appdb user=appuser password=secret host=localhost port=5432"

BASE_DIR = Path(__file__).resolve().parent / "pmdata"

PEOPLE = [f"p{str(i).zfill(2)}" for i in range(1, 17)]

with psycopg.connect(APP_DSN) as conn, conn.cursor() as cur:
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS raw_data (
            id BIGSERIAL PRIMARY KEY,
            json_data JSONB NOT NULL,
            ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )
    conn.commit()

    for person in PEOPLE:
        file_path = BASE_DIR / person / "fitbit" / "heart_rate.json"
        if not file_path.exists():
            print(f"File not found: {file_path}")
            continue

        print(f"\n Loading {person} from {file_path}...")

        with open(file_path, "r", encoding="utf-8") as f:
            raw_records = json.load(f)

        normalized_records = [
            {
                "person_id": person,
                "dateTime": record.get("dateTime"),
                "value": record.get("value", {}),
            }
            for record in raw_records
        ]

        total = len(normalized_records)
        print(f"   {total:,} rows to insert")

        cur.execute(
            """
            CREATE TEMP TABLE raw_stage (
                json_data JSONB
            ) ON COMMIT DROP
            """
        )

        with cur.copy("COPY raw_stage (json_data) FROM STDIN") as cp:
            for i, record in enumerate(normalized_records, start=1):
                cp.write_row((Json(record),))

                if total and (i % max(total // 100, 10_000) == 0 or i == total):
                    percent = (i / total) * 100
                    sys.stdout.write(f"\r   Progress: {percent:.1f}% ({i}/{total})")
                    sys.stdout.flush()

        print("\n   COPY complete. Moving data to raw_data...")

        cur.execute(
            """
            INSERT INTO raw_data (json_data)
            SELECT json_data
            FROM raw_stage
            """
        )

        conn.commit()
        print(f"   {person} data inserted.\n")

print("All files processed.")
