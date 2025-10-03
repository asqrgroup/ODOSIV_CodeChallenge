#!/bin/bash
set -e
echo "Switching to app directory"
cd /home/ec2-user/app 
echo "Inside APP DIR"
#/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml down || true
#/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml up -d --build
if [ ! -f "docker-compose.yml" ]; then
  echo "ERROR: docker-compose.yml not found in APP DIR"
  exit 1
fi
/usr/bin/docker compose -f docker-compose.yml down || true
/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml up -d --build
echo "App container started"
