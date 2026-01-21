#!/bin/bash

# Server Deployment Commands
echo "🚀 Starting server deployment in /opt/salon-backend..."

# Go to deployment directory
cd /opt/salon-backend

# Stop existing containers and clean volumes
echo "🛑 Stopping existing containers..."
docker-compose down -v 2>/dev/null || echo "No containers to stop"

# Force stop any containers using port 3000
echo "🔧 Ensuring port 3000 is free..."
docker ps --filter "publish=3000" --format "{{.ID}}" | xargs -r docker stop 2>/dev/null || true
docker ps -a --filter "publish=3000" --format "{{.ID}}" | xargs -r docker rm 2>/dev/null || true

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
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 20

# Check service health
echo "🔍 Checking service health..."
echo "📊 Container status:"
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo "📊 API URL: http://142.93.220.120:3000"
echo "📚 API Docs: http://142.93.220.120:3000/api"
echo "🔍 Health Check: http://142.93.220.120:3000/health"
