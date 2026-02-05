#!/bin/sh
set -e

echo "Starting database migration..."

# Check if required environment variables are set
if [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_PORT" ]; then
    echo "Error: DATABASE_HOST or DATABASE_PORT is not set."
    exit 1
fi

echo "Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."

# Wait for database with timeout (max 60 seconds)
TIMEOUT=60
ELAPSED=0

while ! nc -z "$DATABASE_HOST" "$DATABASE_PORT" 2>/dev/null; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "Error: Database connection timeout after ${TIMEOUT}s"
        exit 1
    fi
    echo "Database is unavailable - sleeping (${ELAPSED}/${TIMEOUT}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "Database is up - running migrations"

# Navigate to backend directory
cd /app/apps/backend

# Run migrations
npx typeorm-ts-node-commonjs migration:run -d dist/datasource.config.js

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully"
else
    echo "Migration failed!"
    exit 1
fi

echo "Starting application..."
exec "$@"