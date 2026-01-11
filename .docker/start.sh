#!/bin/sh
set -e

echo "Debug: DATABASE_URL length: ${#DATABASE_URL}"
echo "Debug: POSTGRES_URL length: ${#POSTGRES_URL}"

# Ensure POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ] && [ -n "$DATABASE_URL" ]; then
  echo "POSTGRES_URL is unset, using DATABASE_URL"
  export POSTGRES_URL="$DATABASE_URL"
fi

echo "Debug: Checking Node process.env:"
node -e 'console.log("Node env POSTGRES_URL length:", (process.env.POSTGRES_URL || "").length)'
node -e 'console.log("Node env DATABASE_URL length:", (process.env.DATABASE_URL || "").length)'

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm start
