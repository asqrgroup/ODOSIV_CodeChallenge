#!/bin/bash

set -e

cd /home/ec2-user/app

# Use Docker Compose V2 syntax
docker compose pull
docker compose up -d

echo "Containers started"
