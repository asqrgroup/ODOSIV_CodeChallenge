stop.sh
#!/bin/bash
set -e
cd /home/ec2-user/app
/usr/bin/docker compose -f /home/ec2-user/app/docker-compose.yml down || true
#clean up old files so permissions can be set correctly
rm -rf /home/ec2-user/app/*
echo "Containers stopped"
