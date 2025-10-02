#!/bin/bash
set -e

cd /home/ec2-user/app

docker compose -f /home/ec2-user/app/docker-compose.yml pull
docker compose -f /home/ec2-user/app/docker-compose.yml up -d

echo "Containers started successfully"
