#!/bin/bash

# Manual Server Deployment Script
# For server: 142.93.220.120, user: root, password: Style@11Unit

SERVER_IP="142.93.220.120"
SERVER_USER="root"
SERVER_PATH="/opt/salon-backend"
ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)

echo "🚀 Manual Deployment Guide for Salon Backend"
echo "Server: $SERVER_USER@$SERVER_IP"
echo "Path: $SERVER_PATH"
echo "Password: Style@11Unit"
echo ""

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
echo ""

# Create the server deployment script
cat > server_deploy_commands.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

# Server Deployment Commands
echo "🚀 Starting server deployment in /opt/salon-backend..."

# Go to deployment directory
cd /opt/salon-backend

# Stop existing containers and clean volumes
echo "🛑 Stopping existing containers..."
docker compose --profile dev down -v 2>/dev/null || echo "No containers to stop"

# Clean up old files but keep the new zip
echo "🧹 Cleaning up old deployment files..."
find . -maxdepth 1 -name "salon-backend-*.zip" -prune -o -type f -delete 2>/dev/null || true
find . -maxdepth 1 -name "salon-backend-*.zip" -prune -o -type d ! -name "." -exec rm -rf {} + 2>/dev/null || true

# Extract the latest deployment package
ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)
if [ -n "$ZIP_FILE" ]; then
    echo "📦 Extracting $ZIP_FILE..."
    unzip -o "$ZIP_FILE"

    # Move files from extracted directory to current directory
    EXTRACT_DIR=$(unzip -Z1 "$ZIP_FILE" | head -1 | cut -d/ -f1)
    if [ -d "$EXTRACT_DIR" ]; then
        echo "📁 Moving files from $EXTRACT_DIR..."
        cp -r "$EXTRACT_DIR"/* . 2>/dev/null || true
        cp -r "$EXTRACT_DIR"/.[^.]* . 2>/dev/null || true
        rm -rf "$EXTRACT_DIR"
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
fi

# Ensure Docker is installed
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

# Deploy the application
docker compose --profile dev up --build -d

echo "⏳ Waiting for services to start..."
sleep 20

# Check service health
echo "🔍 Checking service health..."
echo "📊 Container status:"
docker compose ps

echo ""
echo "🎉 Deployment completed!"
echo "📊 API URL: http://142.93.220.120:3000"
echo "📚 API Docs: http://142.93.220.120:3000/api"
echo "🔍 Health Check: http://142.93.220.120:3000/health"
DEPLOY_SCRIPT

echo "📋 MANUAL DEPLOYMENT STEPS:"
echo ""
echo "1️⃣ Upload deployment package:"
echo "   scp $ZIP_FILE root@$SERVER_IP:/opt/salon-backend/"
echo "   # When prompted, enter password: Style@11Unit"
echo ""

echo "2️⃣ Upload deployment script:"
echo "   scp server_deploy_commands.sh root@$SERVER_IP:/opt/salon-backend/"
echo ""

echo "3️⃣ Connect to server and deploy:"
echo "   ssh root@$SERVER_IP"
echo "   # When prompted, enter password: Style@11Unit"
echo ""

echo "4️⃣ On the server, run these commands:"
echo "   cd /opt/salon-backend"
echo "   chmod +x server_deploy_commands.sh"
echo "   ./server_deploy_commands.sh"
echo ""

echo "🤖 AUTOMATED COMMANDS (copy and paste):"
echo ""
echo "# Upload files"
echo "scp $ZIP_FILE root@$SERVER_IP:/opt/salon-backend/"
echo "scp server_deploy_commands.sh root@$SERVER_IP:/opt/salon-backend/"
echo ""
echo "# Deploy on server"
echo "ssh root@$SERVER_IP 'cd /opt/salon-backend && chmod +x server_deploy_commands.sh && ./server_deploy_commands.sh'"
echo ""

echo "✅ Files prepared for deployment!"
echo "📁 server_deploy_commands.sh created - this will be uploaded to the server"
echo ""

echo "🔧 After deployment, check status with:"
echo "   ssh root@$SERVER_IP"
echo "   cd /opt/salon-backend"
echo "   docker compose ps"
echo "   docker compose logs -f salon_backend_dev"
echo "   curl http://localhost:3000/health"