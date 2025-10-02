#!/bin/bash
set -e
cd /home/ec2-user/app

# Pull latest images and start containers
/usr/local/bin/docker-compose pull
/usr/local/bin/docker-compose up -d

echo "Containers started"
