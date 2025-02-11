#!/bin/bash

# Load environment variables from .env if not in Docker
if [ ! -z "$IN_DOCKER" ]; then
    # In Docker environment, variables should already be set
    :
elif [ -f ./.env.local ]; then
    export $(cat ./.env.local | grep -v '^#' | xargs)
else
    echo "Error: .env.local file not found"
    exit 1
fi

# Use individual environment variables instead of DATABASE_URL
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Database connection variables not set in environment"
    echo "Required variables: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME"
    exit 1
fi

# Function to check if database exists
check_db_exists() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
    return $?
}

# Function to create database and user
create_db() {
    # First check if postgres superuser exists
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "\du" >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Creating postgres superuser..."
        createuser -s postgres || {
            echo "Error: Failed to create postgres superuser. Please run: createuser -s postgres"
            exit 1
        }
    fi

    # Check if user exists
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1
    USER_EXISTS=$?

    if [ $USER_EXISTS -ne 0 ]; then
        echo "Creating database user '$DB_USER'..."
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "ALTER USER $DB_USER CREATEDB;"
    fi

    if check_db_exists; then
        echo "Database '$DB_NAME' already exists"
    else
        echo "Creating database '$DB_NAME'..."
        # Try with postgres user first (for Docker scenarios)
        PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U postgres "$DB_NAME" || \
        # Fall back to DB_USER if postgres fails
        PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || {
            echo "Error: Failed to create database '$DB_NAME'"
            exit 1
        }
        echo "Database '$DB_NAME' created successfully"
    fi
}

# Function to drop database
drop_db() {
    if check_db_exists; then
        echo "Dropping database '$DB_NAME'..."
        # Try with postgres user first (for Docker scenarios)
        PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U postgres "$DB_NAME" || \
        # Fall back to DB_USER if postgres fails
        PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || {
            echo "Error: Failed to drop database '$DB_NAME'"
            exit 1
        }
        echo "Database '$DB_NAME' dropped successfully"
    else
        echo "Database '$DB_NAME' does not exist"
    fi
}

# Main script
case "$1" in
    "create")
        create_db
        ;;
    "drop")
        drop_db
        ;;
    *)
        echo "Usage: $0 {create|drop}"
        exit 1
        ;;
esac
