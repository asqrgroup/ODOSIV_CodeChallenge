FROM postgres:17

# Install pg_cron for Postgres 17
RUN apt-get update \
 && apt-get install -y postgresql-17-cron \
 && rm -rf /var/lib/apt/lists/*
