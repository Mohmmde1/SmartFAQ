#!/bin/bash

set -e

echo "Entrypoint script is running"
pwd
ls -la

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
    sleep 1
done
echo "PostgreSQL is ready!"

# Run database management script
echo "Running database management script..."
./managedb.sh create

# Generate requirements.txt using Poetry
echo "Generating requirements.txt from Poetry..."
poetry export --without-hashes --output requirements.txt

# Install dependencies using pip
echo "Installing dependencies using pip..."
pip install -r requirements.txt

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start Django development server
echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000
