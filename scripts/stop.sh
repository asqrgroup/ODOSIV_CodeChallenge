#!/bin/bash
set -e

# Create directory if it doesn't exist
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Only stop if docker-compose.yml exists
if [ -f docker-compose.yml ]; then
  /usr/local/bin/docker-compose down || true
fi

echo "Stop script completed"
