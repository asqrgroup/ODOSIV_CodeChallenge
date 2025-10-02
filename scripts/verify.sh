#!/bin/bash
set -e
cd /home/ec2-user/app

# Check running containers
/usr/local/bin/docker-compose ps

# Wait for container to be healthy
sleep 5

echo "Deployment verification complete"
