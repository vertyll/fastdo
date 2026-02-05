#!/bin/sh
set -e

echo "Starting database migration..."

# Wait for database to be ready
echo "Waiting for database..."
until nc -z $DATABASE_HOST $DATABASE_PORT; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations"

# Run migrations
cd /app/apps/backend
npx typeorm-ts-node-commonjs migration:run -d dist/datasource.config.js

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully"
else
    echo "Migration failed!"
    exit 1
fi

# Start the application
echo "Starting application..."
exec node dist/main.js