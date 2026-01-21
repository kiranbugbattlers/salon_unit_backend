#!/bin/bash

# Update and Deploy Script
# Run this after making code changes to deploy latest version
# Usage: ./update-and-deploy.sh [--preserve-db] [--clean-db]

# Default: preserve database data
PRESERVE_DB=true

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --clean-db|--reset-db)
            PRESERVE_DB=false
            shift
            ;;
        --preserve-db)
            PRESERVE_DB=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --preserve-db    Keep database data (default)"
            echo "  --clean-db       Delete all database data and volumes"
            echo "  --reset-db       Same as --clean-db"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🔄 Update and Deploy Latest Code"
echo "================================"
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Database: PRESERVING existing data"
else
    echo "🗑️  Database: CLEANING all data and volumes"
fi
echo ""

# Confirm database deletion if requested
if [ "$PRESERVE_DB" = false ]; then
    echo "⚠️  WARNING: This will delete ALL database data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

echo "🛑 Step 1: Stopping local containers..."
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Preserving database volumes..."
    docker compose --profile dev down
else
    echo "🗑️  Cleaning database and all volumes..."
    docker compose --profile dev down -v
fi
echo ""

echo "📦 Step 2: Creating fresh deployment package..."
# Find and run the deployment package script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_SCRIPT="$SCRIPT_DIR/../utils/create-deployment-package.sh"
DEPLOY_SCRIPT="$SCRIPT_DIR/deploy-to-server.sh"

if [ -f "$PACKAGE_SCRIPT" ]; then
    "$PACKAGE_SCRIPT"
else
    echo "❌ Package creation script not found at: $PACKAGE_SCRIPT"
    exit 1
fi
echo ""

echo "🚀 Step 3: Deploying to server..."
if [ -f "$DEPLOY_SCRIPT" ]; then
    if [ "$PRESERVE_DB" = true ]; then
        "$DEPLOY_SCRIPT" --preserve-db
    else
        "$DEPLOY_SCRIPT" --clean-db
    fi
else
    echo "❌ Deploy script not found at: $DEPLOY_SCRIPT"
    exit 1
fi
echo ""

echo "✅ Update and deployment complete!"
echo "🌐 Your application should be available at:"
echo "   API: http://142.93.220.120:3000"
echo "   Health: http://142.93.220.120:3000/health"
echo "   Docs: http://142.93.220.120:3000/api"
echo ""
echo "🔧 To check deployment status on server:"
echo "   ssh root@142.93.220.120"
echo "   cd /opt/salon-backend"
echo "   docker compose ps"
echo "   docker compose logs -f backend-prod"