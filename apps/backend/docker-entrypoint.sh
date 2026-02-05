#!/bin/sh
set -e

echo "Starting database migration..."

if [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_PORT" ]; then
    echo "Error: DATABASE_HOST or DATABASE_PORT is not set."
    exit 1
fi

echo "Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."

TIMEOUT=60
ELAPSED=0

while ! /usr/bin/nc -z "$DATABASE_HOST" "$DATABASE_PORT" 2>/dev/null; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "Error: Database connection timeout after ${TIMEOUT}s"
        exit 1
    fi
    echo "Database is unavailable - sleeping (${ELAPSED}/${TIMEOUT}s)"
    /bin/sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "Database is up - running migrations"

cd /app/apps/backend

npx typeorm-ts-node-commonjs migration:run -d dist/datasource.config.js

echo "Migrations completed successfully"
echo "Starting application..."
exec "$@"
