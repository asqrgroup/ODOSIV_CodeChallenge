#!/bin/bash
set -e

cd /home/ec2-user/app

/usr/bin/docker build -t odosiv-app .

/usr/bin/docker stop odosiv-app || true
/usr/bin/docker rm odosiv-app || true

/usr/bin/docker run -d \
  --name odosiv-app \
  -p 80:80 \
  -e DB_HOST=my-rds-instance.abcdefgh.us-east-1.rds.amazonaws.com \
  -e DB_PORT=5432 \
  -e DB_NAME=appdb \
  -e DB_USER=appuser \
  -e DB_PASSWORD=secret \
  odosiv-app

echo "Container started"