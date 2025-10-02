#!/bin/bash
set -e

mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

if [ -f docker-compose.yml ]; then
  docker compose down || true
fi

echo "Stop script completed"
