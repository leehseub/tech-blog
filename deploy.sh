#!/bin/bash
set -e

echo "=== Tech Blog Deploy ==="

# Pull latest code
git pull origin main

# Build and start containers
docker compose -f docker-compose.prod.yml up -d --build

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
sleep 10

# Run Prisma migrations
docker compose -f docker-compose.prod.yml exec app npx prisma db push

echo "=== Deploy complete ==="
echo "Site is running at http://$(curl -s ifconfig.me)"
