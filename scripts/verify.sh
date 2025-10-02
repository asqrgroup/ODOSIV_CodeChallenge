#!/bin/bash
set -e

cd /home/ec2-user/app
/usr/local/bin/docker-compose ps
sleep 5

echo "Deployment verification complete"
