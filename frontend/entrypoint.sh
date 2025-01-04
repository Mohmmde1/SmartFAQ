#!/bin/sh
set -e

echo "Waiting for dependencies to be ready..."

# Install dependencies if not already installed
if [ "$NODE_ENV" = "development" ]; then
    echo "Running in development mode..."
    npm install --legacy-peer-deps
    npm run dev
else
    echo "Running in production mode..."
    npm install --production
    npm run build
    npm run start
fi
