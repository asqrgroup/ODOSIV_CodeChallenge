#!/bin/bash
set -e

/usr/bin/docker stop odosiv-app || true
/usr/bin/docker rm odosiv-app || true

echo "Container stopped"
