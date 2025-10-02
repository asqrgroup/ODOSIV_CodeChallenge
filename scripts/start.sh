#!/bin/bash
set -e

cd /home/ec2-user/app

/usr/local/bin/docker-compose pull
/usr/local/bin/docker-compose up -d

echo "Containers started"
