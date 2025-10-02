#!/bin/bash
set -e

echo "===== CodeDeploy: STARTING APP CONTAINER ====="
echo "Running as: $(whoami)"
echo "Current dir before cd: $(pwd)"

# Always switch into the app folder
cd /home/ec2-user/app

# Stop any old containers (ignore errors)
docker compose -f docker-compose.yml down || true

# Start new container
docker compose -f docker-compose.yml up -d

echo "===== CodeDeploy: CONTAINER STARTED SUCCESSFULLY ====="
