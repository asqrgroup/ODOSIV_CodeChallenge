#!/bin/bash
set -e

cd /home/ec2-user/app

docker compose pull
docker compose up -d

echo "Containers started"
