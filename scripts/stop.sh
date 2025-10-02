#!/bin/bash
set -e
cd /home/ec2-user/app
/usr/local/bin/docker-compose down || true
echo "Containers stopped"
