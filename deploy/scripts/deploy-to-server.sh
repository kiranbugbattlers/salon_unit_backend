#!/bin/bash

# Salon Backend - Server Deployment Script
# Deploys to: 142.93.220.120 in /opt/salon-backend
# Usage: ./deploy-to-server.sh [--preserve-db] [--clean-db]

SERVER_IP="142.93.220.120"
SERVER_USER="root"
SERVER_PATH="/opt/salon-backend"

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

ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)

echo "🚀 Deploying Salon Backend to Server..."
echo "Server: $SERVER_USER@$SERVER_IP"
echo "Path: $SERVER_PATH"
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Database: PRESERVING existing data"
else
    echo "🗑️  Database: CLEANING all data and volumes"
fi

# Check if deployment zip exists
if [ -z "$ZIP_FILE" ]; then
    echo "❌ No deployment zip found. Creating one..."
    ./create-deployment-package.sh
    ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)

    if [ -z "$ZIP_FILE" ]; then
        echo "❌ Failed to create deployment package"
        exit 1
    fi
fi

echo "📦 Using deployment package: $ZIP_FILE"

# Upload and deploy script
cat > temp_deploy_script.sh << DEPLOY_SCRIPT
#!/bin/bash

SERVER_PATH="/opt/salon-backend"
PRESERVE_DB=${PRESERVE_DB}
echo "🚀 Starting server deployment..."

# Create directory if it doesn't exist
sudo mkdir -p "$SERVER_PATH"
cd "$SERVER_PATH"

# Stop existing containers
echo "🛑 Stopping existing containers..."
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Preserving database volumes..."
    docker compose --profile dev down 2>/dev/null || echo "No containers to stop"
else
    echo "🗑️  Cleaning database and all volumes..."
    docker compose --profile dev down -v 2>/dev/null || echo "No containers to stop"
fi

# Clean up old files
echo "🧹 Cleaning up old deployment..."
rm -rf src/ package.json package-lock.json tsconfig.json nest-cli.json docker-compose.yml Dockerfile .dockerignore database-init/ .env.example *.sql *.md deploy.sh scripts/ test-* 2>/dev/null || true

echo "📥 Deployment files uploaded successfully"

# Extract the deployment package
ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)
if [ -n "$ZIP_FILE" ]; then
    echo "📦 Extracting $ZIP_FILE..."
    unzip -o "$ZIP_FILE"

    # Move files from extracted directory to current directory
    EXTRACT_DIR=$(unzip -Z1 "$ZIP_FILE" | head -1 | cut -d/ -f1)
    if [ -d "$EXTRACT_DIR" ]; then
        echo "📁 Moving files from $EXTRACT_DIR to current directory..."
        mv "$EXTRACT_DIR"/* . 2>/dev/null || true
        mv "$EXTRACT_DIR"/.[^.]* . 2>/dev/null || true
        rmdir "$EXTRACT_DIR" 2>/dev/null || true
    fi

    # Clean up zip file
    rm "$ZIP_FILE"
else
    echo "❌ No deployment zip file found"
    exit 1
fi

# Set up environment file
if [ ! -f ".env" ]; then
    echo "📝 Setting up environment file..."
    cp .env.example .env

    # Basic production configuration
    cat >> .env << 'ENV_CONFIG'

# Production overrides
NODE_ENV=production
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=salon_backend
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=salon_secure_password_2024

# JWT Secrets (change these in production)
JWT_SECRET=salon_jwt_secret_production_change_this_value
JWT_REFRESH_SECRET=salon_refresh_secret_production_change_this_value
ENV_CONFIG
fi

# Ensure Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Start Docker service
systemctl start docker
systemctl enable docker

echo "🏗️ Building and starting services..."

# Set proper permissions
chmod +x deploy.sh 2>/dev/null || true

# Run the deployment
if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Preserving database for restart..."
    docker compose --profile dev down
else
    echo "🗑️  Cleaning volumes for fresh start..."
    docker compose --profile dev down -v
fi
docker compose --profile dev up --build -d

echo "⏳ Waiting for services to start..."
sleep 15

# Check service health
echo "🔍 Checking service health..."

# Check if containers are running
echo "📊 Container status:"
docker compose ps

# Check backend health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend might still be starting. Checking logs..."
    echo "📋 Recent backend logs:"
    docker compose logs --tail=20 salon_backend_dev
fi

# Show service URLs
echo ""
echo "🎉 Deployment completed!"
echo "📊 API URL: http://142.93.220.120:3000"
echo "📚 API Docs: http://142.93.220.120:3000/api"
echo "🔍 Health Check: http://142.93.220.120:3000/health"
echo ""
echo "📋 Useful commands:"
echo "  docker compose logs -f salon_backend_dev  # View live logs"
echo "  docker compose ps                         # Check container status"
echo "  docker compose restart salon_backend_dev  # Restart backend"
echo "  docker compose down && docker compose up -d  # Full restart"

DEPLOY_SCRIPT

echo "📤 Uploading deployment package to server..."

# Upload files using scp with password authentication
sshpass -p "Style@11Unit" scp "$ZIP_FILE" root@$SERVER_IP:$SERVER_PATH/

echo "📤 Uploading deployment script..."
sshpass -p "Style@11Unit" scp temp_deploy_script.sh root@$SERVER_IP:$SERVER_PATH/deploy_server.sh

echo "🚀 Executing deployment on server..."

# Execute deployment script on server
sshpass -p "Style@11Unit" ssh root@$SERVER_IP << 'SSH_COMMANDS'
cd /opt/salon-backend
chmod +x deploy_server.sh
./deploy_server.sh
SSH_COMMANDS

# Clean up temporary files
rm temp_deploy_script.sh

echo ""
echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   API: http://142.93.220.120:3000"
echo "   Health: http://142.93.220.120:3000/health"
echo "   API Docs: http://142.93.220.120:3000/api"
echo ""
echo "🔧 To check status on server:"
echo "   ssh root@142.93.220.120"
echo "   cd /opt/salon-backend"
echo "   docker compose ps"
echo "   docker compose logs -f salon_backend_dev"