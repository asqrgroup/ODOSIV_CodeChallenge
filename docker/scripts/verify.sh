#!/bin/bash
set -e

if /usr/bin/docker ps | grep -q "odosiv-app"; then
  echo "Container is running"
  exit 0
else
  echo "Container NOT running"
  /usr/bin/docker ps -a
  exit 1
fi