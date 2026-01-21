#!/bin/bash
set -e

echo "🚀 Initializing Salon Backend Database..."

# Create database if it doesn't exist
echo "📊 Creating database: $POSTGRES_DB"
createdb -U "$POSTGRES_USER" "$POSTGRES_DB" || echo "Database already exists"

echo "✅ Database initialization completed!"