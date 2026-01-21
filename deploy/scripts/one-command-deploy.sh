#!/bin/bash

# One-Command Server Deployment
# Usage: ./one-command-deploy.sh [--preserve-db] [--clean-db]

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

echo "🚀 One-Command Salon Backend Deployment"
echo "Server: root@142.93.220.120"
echo "Path: /opt/salon-backend"
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Database: PRESERVING existing data"
else
    echo "🗑️  Database: CLEANING all data and volumes"
fi
echo ""

echo "🛑 Stopping local containers to free up ports..."
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Preserving local database volumes..."
    docker compose --profile dev down 2>/dev/null || echo "No local containers to stop"
else
    echo "🗑️  Cleaning local database and all volumes..."
    docker compose --profile dev down -v 2>/dev/null || echo "No local containers to stop"
fi
echo ""

# Find the deployment zip
ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)

if [ -z "$ZIP_FILE" ]; then
    echo "❌ No deployment zip found. Creating one..."
    ./create-deployment-package.sh
    ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)
fi

echo "📦 Using: $ZIP_FILE"
echo ""

echo "🔐 You will be prompted for password 3 times: Style@11Unit"
echo ""

# Upload deployment package
echo "1️⃣ Uploading deployment package..."
scp "$ZIP_FILE" root@142.93.220.120:/opt/salon-backend/

# Upload deployment script
echo "2️⃣ Uploading deployment script..."
scp server_deploy_commands.sh root@142.93.220.120:/opt/salon-backend/

# Execute deployment
echo "3️⃣ Executing deployment on server..."
ssh root@142.93.220.120 << 'REMOTE_COMMANDS'
cd /opt/salon-backend
chmod +x server_deploy_commands.sh
./server_deploy_commands.sh
REMOTE_COMMANDS

echo ""
echo "✅ Deployment completed!"
echo "🌐 Check your application:"
echo "   API: http://142.93.220.120:3000"
echo "   Health: http://142.93.220.120:3000/health"
echo "   Docs: http://142.93.220.120:3000/api"