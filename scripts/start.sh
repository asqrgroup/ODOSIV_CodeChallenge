#!/bin/bash
set -e
cd /home/ec2-user/app
docker compose -f /home/ec2-user/app/docker-compose.yml down || true
docker compose -f /home/ec2-user/app/docker-compose.yml up -d --build
echo "App container started"
