#!/bin/sh
set -e

echo "Starting database migration..."

if [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_PORT" ]; then
  echo "Error: DATABASE_HOST or DATABASE_PORT is not set."
  exit 1
fi

echo "Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."
until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations"

cd /app/apps/backend

npx typeorm-ts-node-commonjs migration:run -d dist/datasource.config.js

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully"
else
    echo "Migration failed!"
    exit 1
fi

echo "Starting application..."
exec node dist/main.js