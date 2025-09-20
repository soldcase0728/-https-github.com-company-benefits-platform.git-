#!/bin/bash

echo "🚀 Starting Benefits Platform..."

# Start Docker services if not running
echo "Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services
echo "Waiting for services to be ready..."
sleep 5

# Check database connection
echo "Checking database..."
cd packages/database
npx prisma db push --skip-generate 2>/dev/null || echo "Database might need initialization"
cd ../..

# Start the platform
echo "Starting development server..."
npm run dev
