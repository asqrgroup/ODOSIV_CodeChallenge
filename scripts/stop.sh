#!/bin/bash
set -e
cd /home/ec2-user/app
docker compose -f /home/ec2-user/app/docker-compose.yml down || true
echo "Containers stopped"
