#!/bin/bash

# Salon Backend - Deployment Package Creator
# This script creates a production-ready deployment package

echo "🚀 Creating Salon Backend Deployment Package..."

# Create deployment directory
DEPLOY_DIR="salon-backend-deployment"
ZIP_NAME="salon-backend-dev.zip"

# Remove existing deployment directory if it exists
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "📦 Copying essential files..."

# Copy core application files
# IMPORTANT: Copy src as a directory (not its contents) to preserve relative imports
cp -r src "$DEPLOY_DIR/"

# Copy built dist folder if it exists
if [ -d "dist" ]; then
    echo "✅ Copying dist folder..."
    cp -r dist "$DEPLOY_DIR/"
else
    echo "⚠️  Warning: dist folder not found - deployment will need to build on server"
fi

cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp tsconfig.json "$DEPLOY_DIR/"
cp nest-cli.json "$DEPLOY_DIR/"

# Remove macOS extended attributes to avoid Docker issues
echo "🧹 Removing macOS extended attributes..."
xattr -cr "$DEPLOY_DIR" 2>/dev/null || true

# Copy Docker and deployment files (preserve directory structure)
echo "📁 Copying Docker configuration..."
mkdir -p "$DEPLOY_DIR/deploy/docker"

if [ -f "docker-compose.yml" ]; then
    cp docker-compose.yml "$DEPLOY_DIR/"
elif [ -f "deploy/docker/docker-compose.yml" ]; then
    cp deploy/docker/docker-compose.yml "$DEPLOY_DIR/"
    echo "✅ Copied docker-compose.yml from deploy/docker/"
fi

# Fix paths in docker-compose.yml for production
if [ -f "$DEPLOY_DIR/docker-compose.yml" ]; then
    if [ "$(uname)" == "Darwin" ]; then
        sed -i '' 's|.*database-schema.sql.*|      - ./database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql|g' "$DEPLOY_DIR/docker-compose.yml"
        sed -i '' 's|\.\./\.\./database-init|./database-init|g' "$DEPLOY_DIR/docker-compose.yml"
        sed -i '' 's|\.\./\.\./|\./|g' "$DEPLOY_DIR/docker-compose.yml"
    else
        sed -i 's|.*database-schema.sql.*|      - ./database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql|g' "$DEPLOY_DIR/docker-compose.yml"
        sed -i 's|\.\./\.\./database-init|./database-init|g' "$DEPLOY_DIR/docker-compose.yml"
        sed -i 's|\.\./\.\./|\./|g' "$DEPLOY_DIR/docker-compose.yml"
    fi
    echo "📄 Debug: docker-compose.yml content:"
    cat "$DEPLOY_DIR/docker-compose.yml"
fi

# Copy Dockerfiles to both root and deploy/docker for compatibility
if [ -f "Dockerfile" ]; then
    cp Dockerfile "$DEPLOY_DIR/"
    cp Dockerfile "$DEPLOY_DIR/deploy/docker/"
elif [ -f "deploy/docker/Dockerfile" ]; then
    cp deploy/docker/Dockerfile "$DEPLOY_DIR/"
    cp deploy/docker/Dockerfile "$DEPLOY_DIR/deploy/docker/"
    echo "✅ Copied Dockerfile from deploy/docker/"
fi

# Copy production Dockerfile if it exists
if [ -f "deploy/docker/Dockerfile.prod" ]; then
    cp deploy/docker/Dockerfile.prod "$DEPLOY_DIR/deploy/docker/"
    echo "✅ Copied optimized Dockerfile.prod"
fi

if [ -f ".dockerignore" ]; then
    cp .dockerignore "$DEPLOY_DIR/"
elif [ -f "deploy/docker/.dockerignore" ]; then
    cp deploy/docker/.dockerignore "$DEPLOY_DIR/"
    echo "✅ Copied .dockerignore from deploy/docker/"
fi

# Copy database and configuration files
echo "📁 Copying database directory and migrations..."
cp -r database-init/ "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️  database-init/ not found, skipping..."
cp -r database/ "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️  database/ directory not found, skipping..."

# Copy run-migrations.sh to root of deployment for easy access
# The script itself will look in database/migrations/ for the actual migration files
if [ -f "database/run-migrations.sh" ]; then
    cp database/run-migrations.sh "$DEPLOY_DIR/" && chmod +x "$DEPLOY_DIR/run-migrations.sh"
    echo "✅ Copied run-migrations.sh to deployment root"
else
    echo "⚠️  database/run-migrations.sh not found, skipping..."
fi

cp .env.example "$DEPLOY_DIR/"
cp reset-database.sql "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️  reset-database.sql not found, skipping..."
cp fix-business-owner-constraints.sql "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️  fix-business-owner-constraints.sql not found, skipping..."

# Copy nginx configuration file
if [ -f "nginx.conf" ]; then
    cp nginx.conf "$DEPLOY_DIR/"
elif [ -f "deploy/docker/nginx.conf" ]; then
    cp deploy/docker/nginx.conf "$DEPLOY_DIR/"
    echo "✅ Copied nginx.conf from deploy/docker/"
fi

# Copy database schema if it exists
if [ -f "database-schema.sql" ]; then
    cp database-schema.sql "$DEPLOY_DIR/"
elif [ -f "database/schema/database-schema.sql" ]; then
    cp database/schema/database-schema.sql "$DEPLOY_DIR/"
    echo "✅ Copied database-schema.sql from database/schema/"
fi

# Copy documentation and scripts
cp README.md "$DEPLOY_DIR/"
cp -r scripts/ "$DEPLOY_DIR/" 2>/dev/null || echo "No scripts directory found, skipping..."


echo "📋 Creating deployment documentation..."

# Create deployment README
cat > "$DEPLOY_DIR/DEPLOYMENT.md" << 'EOF'
# Salon Backend - Deployment Guide

## Pre-requisites
- Docker and Docker Compose installed
- Server with at least 2GB RAM
- Open ports: 3000 (API), 5432 (PostgreSQL), 6379 (Redis)

## Quick Start

### 1. Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Database Cleanup (if upgrading)
```bash
# Stop existing containers and remove old data
docker compose --profile dev down -v

# Optional: Run database reset if needed
docker exec -i salon_postgres psql -U postgres -d salon_backend < reset-database.sql
```

### 3. Start Services
```bash
# Start in development mode
docker compose --profile dev up --build

# Or start in production mode
docker compose up --build -d
```

### 4. Verify Deployment
- API will be available at: http://localhost:3000
- Health check: GET http://localhost:3000/health
- API Documentation: http://localhost:3000/api

## Important Notes

### Database Schema
- All "barber" references have been updated to "business_owner"
- Fresh database will be created automatically
- Old barber_id columns are replaced with business_owner_id

### Environment Variables
Make sure to configure these in your .env file:
- DATABASE_HOST, DATABASE_PORT, DATABASE_NAME
- JWT_SECRET, JWT_REFRESH_SECRET
- TWILIO_*, AWS_*, SUPABASE_* credentials
- NODE_ENV=production for production deployment

### File Structure
- `/src` - Source code
- `/database` - Database migrations and scripts
- `/database/migrations` - SQL migration files
- `/database/run-migrations.sh` - Migration execution script
- `run-migrations.sh` - Migration runner (in deployment root)
- `/database-init` - Database initialization scripts
- `docker-compose.yml` - Container orchestration
- `test-with-postman.json` - API testing collection

### Troubleshooting
1. If you get foreign key constraint errors, run: `reset-database.sql`
2. Check logs: `docker compose logs salon_backend_dev`
3. Database issues: `docker compose logs salon_postgres`

### Security
- Change default passwords in production
- Use environment variables for all secrets
- Configure firewall rules appropriately
- Enable SSL/TLS for production
EOF

# Create deployment script
cat > "$DEPLOY_DIR/deploy.sh" << 'EOF'
#!/bin/bash

echo "🚀 Deploying Salon Backend..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before proceeding."
    echo "After editing .env, run this script again."
    exit 1
fi

echo "🗑️  Cleaning up old containers and volumes..."
docker compose --profile dev down -v 2>/dev/null || true

echo "🏗️  Building and starting services..."
docker compose --profile dev up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is healthy
echo "🔍 Checking service health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend might still be starting. Check logs with: docker compose logs salon_backend_dev"
fi

echo "🎉 Deployment complete!"
echo "📊 API available at: http://localhost:3000"
echo "📚 API docs at: http://localhost:3000/api"
echo "🔍 Check logs: docker compose logs -f salon_backend_dev"
EOF

chmod +x "$DEPLOY_DIR/deploy.sh"

# Create production docker-compose override
cat > "$DEPLOY_DIR/docker-compose.prod.yml" << 'EOF'
version: '3.8'

services:
  backend-dev:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  postgres:
    restart: unless-stopped

  redis:
    restart: unless-stopped
EOF

echo "🗜️  Creating zip package..."
# Use standard zip to avoid macOS metadata issues on Linux servers
# IMPORTANT: Include dist/ folder for faster deployment (no rebuild needed)
zip -r "$ZIP_NAME" "$DEPLOY_DIR/" -x "*.git*" "node_modules/*" "logs/*" "__MACOSX/*" "*.DS_Store" "*/.DS_Store"

echo "✅ Deployment package created: $ZIP_NAME"
echo "📁 Temporary directory: $DEPLOY_DIR"
echo ""
echo "📋 Package Contents:"
echo "   - Source code (src/)"
echo "   - Built application (dist/) ✨"
echo "   - Docker configuration (deploy/docker/)"
echo "   - Database scripts (database/)"
echo "   - Database migrations (database/migrations/)"
echo "   - Migration runner (run-migrations.sh)"
echo "   - Deployment documentation"
echo "   - Testing files"
echo "   - Automated deployment script"
echo ""
echo "🚀 To deploy on server:"
echo "   1. Upload $ZIP_NAME to your server"
echo "   2. unzip $ZIP_NAME"
echo "   3. cd salon-backend-deployment/"
echo "   4. cp .env.example .env && nano .env"
echo "   5. ./deploy.sh"

# Cleanup temporary directory
read -p "🗑️  Remove temporary directory $DEPLOY_DIR? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$DEPLOY_DIR"
    echo "✅ Temporary directory removed"
fi

echo "🎉 Done!"