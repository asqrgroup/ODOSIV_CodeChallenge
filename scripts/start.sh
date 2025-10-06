#!/bin/bash
set -e
APP_DIR="/home/ec2-user/app"

echo "Switching to app directory: $APP_DIR"
cd $APP_DIR || { echo "Directory $APP_DIR not found"; exit 1; }

#cd /home/ec2-user/app 
echo "Inside APP DIR  $APP_DIR"
#/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml down || true
#/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml up -d --build
if [ ! -f "docker-compose.yml" ]; then
  echo "ERROR: Here docker-compose.yml not found in APP DIR $APP_DIR"
  exit 1
fi
/usr/bin/docker compose -f docker-compose.yml down || true
/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml up -d --build
echo "App container started"
