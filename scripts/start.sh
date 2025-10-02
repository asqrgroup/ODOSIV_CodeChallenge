#!/bin/bash
set -e

echo "===== DEBUG INFO START ====="
echo "Running as user: $(whoami)"
echo "Groups: $(id)"
echo "Current dir: $(pwd)"
echo "Docker path: $(which docker || echo 'docker not found')"
echo "Docker compose path: $(which docker-compose || echo 'docker-compose not found')"
docker --version || true
docker compose version || true
echo "Listing /home/ec2-user/app:"
ls -l /home/ec2-user/app || true
echo "===== DEBUG INFO END ====="

cd /home/ec2-user/app

# run docker compose explicitly
/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml up -d || {
    echo "Docker compose failed"
    exit 14
}

echo "Containers started successfully"
