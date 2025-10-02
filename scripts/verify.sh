#!/bin/bash
set -e

cd /home/ec2-user/app

# Check that at least one container is running
if docker ps | grep -q my_app; then
  echo "App container is running"
  exit 0
else
  echo "App container is NOT running"
  exit 1
fi
