#!/bin/bash

set -e

cd /home/ec2-user/app

docker compose ps

sleep 5

echo "Deployment verification complete"
