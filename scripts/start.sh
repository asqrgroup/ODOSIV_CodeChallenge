#!/bin/bash
set -e

cd /home/ec2-user/app

# Stop old containers safely
docker compose down || true

# Build and start app container only
docker compose up -d

echo "App container started (using RDS for database)"
