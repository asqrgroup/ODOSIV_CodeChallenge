!/bin/bash
set -e

echo "===== DEBUG INFO ====="
echo "Running as: $(whoami)"
echo "Current directory: $(pwd)"

cd /home/ec2-user/app
echo "Changed to: $(pwd)"

echo "Files in directory:"
ls -la

echo "Checking if docker-compose.yml exists:"
if [ -f docker-compose.yml ]; then
  echo "File exists!"
else
  echo "File NOT found!"
  exit 1
fi

echo "Running docker compose down..."
/usr/bin/docker compose -f docker-compose.yml down || true

echo "Running docker compose up..."
/usr/bin/docker compose -f docker-compose.yml up -d --build

echo "===== DEPLOYMENT COMPLETE ====="
