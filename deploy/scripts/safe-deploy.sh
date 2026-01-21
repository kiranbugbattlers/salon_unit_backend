#!/bin/bash

# Safe Deployment Script for Salon Backend
# This script fixes the nginx configuration issue and deploys properly

SERVER_IP="142.93.220.120"
SERVER_USER="root"
SERVER_PATH="/opt/salon-backend"

echo "🚀 Safe Deployment Script for Salon Backend"
echo "Server: $SERVER_USER@$SERVER_IP"
echo "Path: $SERVER_PATH"
echo ""

# Parse command line arguments
PRESERVE_DB=true
for arg in "$@"; do
    case $arg in
        --clean-db|--reset-db)
            PRESERVE_DB=false
            ;;
        --preserve-db)
            PRESERVE_DB=true
            ;;
    esac
done

if [ "$PRESERVE_DB" = true ]; then
    echo "📊 Database: PRESERVING existing data"
else
    echo "🗑️  Database: CLEANING all data and volumes"
fi
echo ""

# Step 1: Build the application
echo "🔨 Step 1: Building application..."
echo "Running: npm run build"
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build completed successfully"

# Step 2: Stop local containers
echo ""
echo "🛑 Step 2: Stopping local containers..."
if [ "$PRESERVE_DB" = true ]; then
    docker compose down 2>/dev/null || echo "No local containers to stop"
else
    docker compose down -v 2>/dev/null || echo "No local containers to stop"
fi

# Step 3: Create deployment package
echo ""
echo "📦 Step 3: Creating deployment package..."
rm -f salon-backend-*.zip
ZIP_FILE=""

if [ -z "$ZIP_FILE" ]; then
    echo "❌ No deployment zip found. Creating one..."

    # Find and run the deployment package script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PACKAGE_SCRIPT="$SCRIPT_DIR/../utils/create-deployment-package.sh"

    if [ -f "$PACKAGE_SCRIPT" ]; then
        "$PACKAGE_SCRIPT"
    else
        echo "❌ Package creation script not found at: $PACKAGE_SCRIPT"
        exit 1
    fi

    ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)

    if [ -z "$ZIP_FILE" ]; then
        echo "❌ Failed to create deployment package"
        exit 1
    fi
fi

echo "📦 Using deployment package: $ZIP_FILE"

# Step 4: Create a fixed nginx configuration
echo ""
echo "🔧 Step 4: Creating fixed nginx configuration..."
cat > nginx-fixed.conf << 'NGINX_CONF'
events {
    worker_connections 1024;
}

http {
    # File upload settings
    client_max_body_size 100M;
    client_body_timeout 120s;
    client_header_timeout 120s;

    upstream backend {
        server salon_backend_prod:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # CORS headers
        # CORS headers - Handled by Application


        # Increase rate limiting
        limit_req zone=api burst=100 nodelay;

        # Handle OPTIONS requests in separate location


        # API routes (most specific first)
        location /api/ {


            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # File upload settings
            client_max_body_size 100M;
            proxy_connect_timeout 120s;
            proxy_send_timeout 120s;
            proxy_read_timeout 120s;
            proxy_buffering off;
            proxy_request_buffering off;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Default route
        location / {
            return 200 '{"message":"Salon Booking API","docs":"/api/docs","health":"/health"}';
            add_header Content-Type application/json;
        }

        # Error pages
        error_page 404 /404.json;
        location = /404.json {
            return 404 '{"error":"Not Found","statusCode":404}';
            add_header Content-Type application/json;
        }

        error_page 500 502 503 504 /50x.json;
        location = /50x.json {
            return 500 '{"error":"Internal Server Error","statusCode":500}';
            add_header Content-Type application/json;
        }
    }
}
NGINX_CONF

# Step 5: Create server deployment script
echo ""
echo "🛠️ Step 5: Creating server deployment script..."
cat > safe-server-deploy.sh << 'SERVER_SCRIPT'
#!/bin/bash

echo "🚀 Starting safe server deployment..."
cd /opt/salon-backend

# Check if running via docker-compose or standalone containers
if [ -f "docker-compose.yml" ]; then
    echo "🛑 Stopping docker-compose containers..."
    docker compose down || echo "No docker-compose containers to stop"
else
    echo "🛑 Detected standalone container setup..."
    echo "   Only stopping backend container (preserving database and redis)..."
    docker stop salon_backend_prod 2>/dev/null || echo "Backend container not running"
fi

# Extract deployment package
ZIP_FILE=$(ls salon-backend-*.zip 2>/dev/null | head -1)
if [ -n "$ZIP_FILE" ]; then
    echo "📦 Extracting $ZIP_FILE..."

    # Extract to temporary directory first
    TEMP_DIR="temp_extract_$$"
    mkdir -p "$TEMP_DIR"
    unzip -q -o "$ZIP_FILE" -d "$TEMP_DIR"

    # Clean up macOS metadata directories
    rm -rf "$TEMP_DIR/__MACOSX" 2>/dev/null || true

    # Find the extracted directory
    EXTRACT_DIR=$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -1)

    if [ -n "$EXTRACT_DIR" ] && [ -d "$EXTRACT_DIR" ]; then
        echo "📁 Moving files from $(basename $EXTRACT_DIR)..."

        # Clean up old root-level source directories AND files BEFORE copying new files
        echo "🧹 Cleaning up old root-level source files..."

        # Remove old directories
        for dir in entities migrations database admin auth booking payment business business-owner subscription staff customer wallet services common config types support-member user-address advertisement approval browse; do
          if [ -d "$dir" ] && [ ! -L "$dir" ]; then
            echo "  Removing directory: $dir/"
            rm -rf "$dir"
          fi
        done

        # Remove old loose TypeScript files that should be in src/
        echo "  Removing old loose source files..."
        rm -f app.module.ts main.ts switch-db.js *.entity.ts 2>/dev/null || true

        # Use rsync to preserve all attributes and structure
        if command -v rsync &> /dev/null; then
            rsync -a "$EXTRACT_DIR/" . --exclude=".DS_Store"
        else
            # Fallback to cp with archive mode
            cp -a "$EXTRACT_DIR"/* . 2>/dev/null || true
            cp -a "$EXTRACT_DIR"/.[^.]* . 2>/dev/null || true
        fi

        rm -rf "$TEMP_DIR"
    fi

    rm "$ZIP_FILE"
fi

# Set up environment file
if [ ! -f ".env" ]; then
    echo "📝 Setting up environment file..."
    cp .env.example .env
fi

# Update nginx configuration to use backend-prod
if [ -f "nginx-fixed.conf" ]; then
    echo "🔧 Updating nginx configuration..."
    cp nginx-fixed.conf nginx.conf

    # If nginx container exists, update its config and restart
    if docker ps -a --format '{{.Names}}' | grep -q '^salon_nginx$'; then
        echo "   Updating nginx container configuration..."
        docker cp nginx.conf salon_nginx:/etc/nginx/nginx.conf
        docker restart salon_nginx
    fi
fi

# Check deployment mode
if [ -f "docker-compose.yml" ]; then
    echo "🏗️ Using docker-compose deployment mode..."

    # Start PostgreSQL first
    echo "🗄️ Starting PostgreSQL database..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d postgres

    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10

    # Run database migrations
    echo "🔄 Running database migrations..."
    if [ -f "run-migrations.sh" ]; then
        chmod +x run-migrations.sh
        export DATABASE_HOST=localhost
        export DATABASE_PORT=5432
        export DATABASE_NAME=salon_backend
        export DATABASE_USERNAME=salon_user
        if [ -f ".env" ]; then
            source .env
            export DATABASE_PASSWORD="${DATABASE_PASSWORD:-salon_password}"
        else
            export DATABASE_PASSWORD=salon_password
        fi
        ./run-migrations.sh || echo "⚠️  Migrations completed with warnings"
    else
        echo "⚠️  Migration script not found, skipping migrations"
    fi

    # Start services in production mode
    echo "🏗️ Building and starting production services..."
    docker stop salon_backend_prod salon_redis salon_nginx 2>/dev/null || true
    docker rm salon_backend_prod salon_redis salon_nginx 2>/dev/null || true
    docker compose --profile prod build --no-cache
    docker compose --profile prod up -d

    echo "⏳ Waiting for services to start..."
    sleep 30

    # Check service status
    echo "🔍 Checking service status..."
    docker compose ps
else
    echo "🏗️ Using standalone container deployment mode..."

    # Ensure database is running (should already be up with --preserve-db)
    if ! docker ps --format '{{.Names}}' | grep -q '^salon_postgres$'; then
        echo "⚠️  Warning: PostgreSQL container not running!"
        echo "   Starting PostgreSQL..."
        docker start salon_postgres 2>/dev/null || echo "   Could not start postgres - may need manual intervention"
        sleep 10
    else
        echo "✅ PostgreSQL container already running"
    fi

    # Run database migrations
    echo "🔄 Running database migrations..."
    if [ -f "run-migrations.sh" ]; then
        chmod +x run-migrations.sh
        export DATABASE_HOST=localhost
        export DATABASE_PORT=5432
        export DATABASE_NAME=salon_backend
        export DATABASE_USERNAME=salon_user
        if [ -f ".env" ]; then
            source .env
            export DATABASE_PASSWORD="${DATABASE_PASSWORD:-salon_password}"
        else
            export DATABASE_PASSWORD=salon_password
        fi
        ./run-migrations.sh || echo "⚠️  Migrations completed with warnings"
    fi

    # Rebuild Docker image and recreate container
    echo "🏗️ Rebuilding Docker image with new code..."
    if [ -f "deploy/docker/Dockerfile" ]; then
        # Build new Docker image
        echo "   Building salon-backend-prod:latest..."
        docker build --no-cache -f deploy/docker/Dockerfile -t salon-backend-prod:latest --target runner .

        if [ $? -ne 0 ]; then
            echo "❌ Docker build failed!"
            exit 1
        fi

        echo "✅ Docker image built successfully"

        # Stop and remove old container
        echo "   Stopping and removing old container..."
        docker stop salon_backend_prod 2>/dev/null || true
        docker rm salon_backend_prod 2>/dev/null || true

        # Get Firebase file path if it exists
        FIREBASE_MOUNT=""
        if [ -f "style-plus-project-firebase-adminsdk-fbsvc-0272b1d083.json" ]; then
            FIREBASE_MOUNT="-v /opt/salon-backend/style-plus-project-firebase-adminsdk-fbsvc-0272b1d083.json:/app/style-plus-project-firebase-adminsdk-fbsvc-0272b1d083.json:ro"
            echo "   Found Firebase credentials file"
        fi

        # Create new container with updated image
        echo "   Creating new container with updated image..."
        docker run -d \
          --name salon_backend_prod \
          --restart unless-stopped \
          --network docker_salon_network \
          --env-file .env \
          -e NODE_ENV=production \
          -e PORT=3000 \
          -e APP_PORT=3000 \
          -e DATABASE_HOST=salon_postgres \
          -e REDIS_HOST=salon_redis \
          -p 3000:3000 \
          -v /opt/salon-backend/logs:/app/logs \
          $FIREBASE_MOUNT \
          salon-backend-prod:latest

        if [ $? -ne 0 ]; then
            echo "❌ Failed to create new container!"
            exit 1
        fi

        echo "✅ New container created successfully"
    else
        echo "⚠️  Dockerfile not found - skipping backend update"
    fi

    echo "⏳ Waiting for backend to start..."
    sleep 20

    # Check service status
    echo "🔍 Checking service status..."
    docker ps --filter "name=salon_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

# Test API health
echo ""
echo "🔍 Testing API health..."
sleep 5
curl -f http://localhost:3000/health && echo " ✅ Direct backend health check passed" || echo " ❌ Direct backend health check failed"

echo ""
echo "🎉 Deployment completed!"
echo "📊 API URL: http://142.93.220.120:3000"
echo "📚 API Docs: http://142.93.220.120:3000/api"
echo "🔍 Health Check: http://142.93.220.120:3000/health"
SERVER_SCRIPT

chmod +x safe-server-deploy.sh

echo "✅ Fixed deployment scripts created!"
echo ""

# Step 6: Execute deployment
echo "🚀 Step 6: Executing deployment..."
echo "🔐 You'll be prompted for the server password 3 times"
echo ""

# Upload deployment package
echo "📤 Uploading deployment package..."
scp "$ZIP_FILE" root@$SERVER_IP:/opt/salon-backend/

# Upload fixed nginx config
echo "📤 Uploading fixed nginx configuration..."
scp nginx-fixed.conf root@$SERVER_IP:/opt/salon-backend/

# Upload deployment script
echo "📤 Uploading deployment script..."
scp safe-server-deploy.sh root@$SERVER_IP:/opt/salon-backend/

# Execute deployment
echo "🏗️ Executing deployment on server..."
ssh root@$SERVER_IP "cd /opt/salon-backend && chmod +x safe-server-deploy.sh && ./safe-server-deploy.sh"

# Clean up local files
rm -f nginx-fixed.conf safe-server-deploy.sh

echo ""
echo "✅ Safe deployment completed!"
echo ""
echo "🌐 Your application should be available at:"
echo "   API: http://142.93.220.120:3000"
echo "   Health: http://142.93.220.120:3000/health" 
echo "   Docs: http://142.93.220.120:3000/api"
echo ""
echo "🔧 To check deployment status:"
echo "   ssh root@142.93.220.120"
echo "   cd /opt/salon-backend"
echo "   docker compose ps"
echo "   docker compose logs -f backend-prod"