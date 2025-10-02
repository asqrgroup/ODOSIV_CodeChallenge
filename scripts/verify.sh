#!/bin/bash
set -e

# Verify the app container is running
if docker ps --format '{{.Names}}' | grep -q "my_app"; then
  echo "App container 'my_app' is running"
  exit 0
else
  echo "App container 'my_app' is NOT running"
  docker ps -a   # show all containers for debugging
  exit 1
fi
