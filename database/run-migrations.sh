#!/bin/bash

# Database Migration Runner
# Runs all SQL migrations in src/database/migrations/
# Can run either from host (using psql) or inside Docker container

set -e  # Exit on error

echo "=========================================="
echo "🔄 DATABASE MIGRATION RUNNER"
echo "=========================================="
echo ""

# Check if running inside Docker or on host
if [ -f /.dockerenv ]; then
    echo "ℹ️  Running inside Docker container"
    RUN_MODE="docker"
else
    echo "ℹ️  Running on host machine"
    RUN_MODE="host"
fi

# Get database connection details from environment or use defaults
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-salon_backend}"
DB_USER="${DATABASE_USERNAME:-salon_user}"
DB_PASSWORD="${DATABASE_PASSWORD:-salon_password}"

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Check if we should use Docker exec instead
if [ "$RUN_MODE" = "host" ] && command -v docker &> /dev/null && docker ps | grep -q salon_postgres; then
    echo "✨ Using Docker postgres container for migrations"
    USE_DOCKER_EXEC=true
else
    USE_DOCKER_EXEC=false

    # Check if psql is available on host
    if ! command -v psql &> /dev/null; then
        echo "❌ psql not found. Installing..."
        apt-get update && apt-get install -y postgresql-client
    fi
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
if [ "$USE_DOCKER_EXEC" = true ]; then
    until docker exec salon_postgres pg_isready -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; do
        echo "   Database is unavailable - sleeping"
        sleep 2
    done
else
    until psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
        echo "   Database is unavailable - sleeping"
        sleep 2
    done
fi

echo "✅ Database is ready"
echo ""

# Run all migration files
# Try database/migrations first (new structure), fallback to src/database/migrations (old structure)
MIGRATION_DIR="database/migrations"

if [ ! -d "$MIGRATION_DIR" ]; then
    echo "⚠️  Primary migrations directory not found at $MIGRATION_DIR"
    echo "   Checking fallback location: src/database/migrations"
    MIGRATION_DIR="src/database/migrations"

    if [ ! -d "$MIGRATION_DIR" ]; then
        echo "⚠️  No migrations directory found at either location"
        echo "   Checked: database/migrations and src/database/migrations"
        exit 0
    fi
fi

echo "📂 Using migrations directory: $MIGRATION_DIR"

# Find all .sql files and sort them (numerical order for versioned migrations)
MIGRATIONS=$(find "$MIGRATION_DIR" -name "*.sql" -type f | sort)

if [ -z "$MIGRATIONS" ]; then
    echo "ℹ️  No migration files found in $MIGRATION_DIR"
    exit 0
fi

# Count migrations
MIGRATION_COUNT=$(echo "$MIGRATIONS" | wc -l | tr -d ' ')
echo "📁 Found $MIGRATION_COUNT migration file(s) to process"
echo ""

# ⚠️ IMPORTANT: Backup reminder
echo "=========================================="
echo "⚠️  BACKUP REMINDER"
echo "=========================================="
echo "Before running migrations in production:"
echo "1. Create database backup:"
echo "   pg_dump -U $DB_USER -d $DB_NAME -F c -f backup_\$(date +%Y%m%d_%H%M%S).dump"
echo ""
read -p "Press ENTER to continue with migrations (or Ctrl+C to abort)..." -t 10 || echo ""
echo ""

# Track success/failure
SUCCESSFUL=0
FAILED=0
WARNINGS=0

# Run each migration
COUNTER=1
for migration in $MIGRATIONS; do
    filename=$(basename "$migration")
    echo "=========================================="
    echo "[$COUNTER/$MIGRATION_COUNT] 📝 Running: $filename"
    echo "=========================================="

    # Capture migration output
    MIGRATION_OUTPUT=""
    MIGRATION_SUCCESS=false
    
    if [ "$USE_DOCKER_EXEC" = true ]; then
        # Copy migration to container and run it
        docker cp "$migration" salon_postgres:/tmp/"$filename"
        MIGRATION_OUTPUT=$(docker exec salon_postgres psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/"$filename" 2>&1)
        MIGRATION_EXIT_CODE=$?
        docker exec salon_postgres rm /tmp/"$filename" 2>/dev/null || true
    else
        # Run directly from host
        MIGRATION_OUTPUT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration" 2>&1)
        MIGRATION_EXIT_CODE=$?
    fi

    # Display migration output
    echo "$MIGRATION_OUTPUT"
    echo ""

    # Check migration result
    if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
        echo "❌ Migration FAILED: $filename (exit code: $MIGRATION_EXIT_CODE)"
        FAILED=$((FAILED + 1))
        echo ""
        echo "Aborting remaining migrations due to failure."
        break
    elif echo "$MIGRATION_OUTPUT" | grep -qi "ERROR"; then
        # PostgreSQL ERROR in output
        if echo "$MIGRATION_OUTPUT" | grep -qi "already exists"; then
            echo "⚠️  Migration already applied: $filename (skipped)"
            WARNINGS=$((WARNINGS + 1))
        else
            echo "❌ Migration FAILED with errors: $filename"
            FAILED=$((FAILED + 1))
            echo ""
            echo "Aborting remaining migrations due to error."
            break
        fi
    elif echo "$MIGRATION_OUTPUT" | grep -q "✓✓✓ MIGRATION COMPLETED SUCCESSFULLY"; then
        echo "✅ Migration completed successfully: $filename"
        SUCCESSFUL=$((SUCCESSFUL + 1))
    elif echo "$MIGRATION_OUTPUT" | grep -q "⚠⚠⚠ MIGRATION COMPLETED WITH WARNINGS"; then
        echo "⚠️  Migration completed with warnings: $filename"
        WARNINGS=$((WARNINGS + 1))
    elif echo "$MIGRATION_OUTPUT" | grep -qi "COMMIT"; then
        echo "✅ Migration completed: $filename"
        SUCCESSFUL=$((SUCCESSFUL + 1))
    else
        echo "⚠️  Migration status unclear: $filename"
        WARNINGS=$((WARNINGS + 1))
    fi

    COUNTER=$((COUNTER + 1))
    echo ""
done

# Final summary
echo "=========================================="
echo "📊 MIGRATION SUMMARY"
echo "=========================================="
echo "Total migrations: $MIGRATION_COUNT"
echo "✅ Successful: $SUCCESSFUL"
echo "⚠️  Warnings: $WARNINGS"
echo "❌ Failed: $FAILED"
echo "=========================================="
echo ""

# Exit with appropriate code
if [ $FAILED -gt 0 ]; then
    echo "❌ Migration process completed with FAILURES"
    echo "   Please review the errors above and fix before deploying."
    unset PGPASSWORD
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Migration process completed with WARNINGS"
    echo "   Review warnings above to ensure expected behavior."
    unset PGPASSWORD
    exit 0
else
    echo "🎉 All migrations completed successfully!"
    unset PGPASSWORD
    exit 0
fi
