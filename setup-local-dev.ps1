# Salon Backend - Local Development Setup Script for Windows
# Save this as setup-local-dev.ps1 and run it in PowerShell as Administrator

# Color setup
$ErrorActionPreference = "Stop"
$ProgressPreference = 'SilentlyContinue'

# Colors for output
$colors = @{
    Red = '\e[31m'
    Green = '\e[32m'
    Yellow = '\e[33m'
    Blue = '\e[34m'
    Purple = '\e[35m'
    Cyan = '\e[36m'
    NC = '\e[0m'
}

function Write-Status {
    param([string]$message)
    Write-Host "${$colors.Blue}[INFO]${$colors.NC} $message"
}

function Write-Success {
    param([string]$message)
    Write-Host "${$colors.Green}[SUCCESS]${$colors.NC} $message"
}

function Write-Warning {
    param([string]$message)
    Write-Host "${$colors.Yellow}[WARNING]${$colors.NC} $message"
}

function Write-Error {
    param([string]$message)
    Write-Host "${$colors.Red}[ERROR]${$colors.NC} $message"
}

function Write-Header {
    param([string]$message)
    Write-Host "${$colors.Purple}========================================${$colors.NC}"
    Write-Host "${$colors.Purple}$message${$colors.NC}"
    Write-Host "${$colors.Purple}========================================${$colors.NC}"
}

# Check if running as Administrator
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check Docker installation
function Test-DockerInstalled {
    try {
        $dockerVersion = docker --version
        $dockerComposeVersion = docker-compose --version
        Write-Success "Docker is installed: $dockerVersion"
        Write-Success "Docker Compose is installed: $dockerComposeVersion"
        return $true
    } catch {
        Write-Error "Docker or Docker Compose is not installed or not in PATH"
        return $false
    }
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>&1
        if ($dockerInfo -match "Cannot connect to the Docker daemon") {
            Write-Error "Docker daemon is not running. Please start Docker Desktop."
            return $false
        }
        return $true
    } catch {
        Write-Error "Failed to connect to Docker daemon. Is Docker Desktop running?"
        return $false
    }
}

# Create .env file if it doesn't exist
function Initialize-Environment {
    $envFile = ".\.env"
    $envExample = ".\.env.example"
    
    if (Test-Path $envFile) {
        Write-Status ".env file already exists. Using existing configuration."
        return
    }

    if (Test-Path $envExample) {
        Write-Status "Creating .env file from .env.example..."
        Copy-Item -Path $envExample -Destination $envFile
        Write-Success "Created .env file from .env.example"
    } else {
        Write-Status "Creating default .env file..."
        @"
# Application Configuration
NODE_ENV=development
PORT=3000
APP_PORT=3000

# Database Configuration
DB_MODE=local
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=salon_user
DATABASE_PASSWORD=salon_password
DATABASE_NAME=salon_backend

# JWT Configuration
JWT_SECRET=dev-jwt-secret-change-in-production-12345678
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP Configuration (Console mode for development)
OTP_PROVIDER=console
OTP_EXPIRY_MINUTES=5
"@ | Out-File -FilePath $envFile -Encoding utf8
        Write-Success "Created default .env file"
    }
}

# Start Docker services
function Start-Services {
    Write-Header "Starting Docker Services"
    
    try {
        # Pull latest images
        Write-Status "Pulling Docker images..."
        docker-compose -f .\deploy\docker\docker-compose.yml pull
        
        # Start services
        Write-Status "Starting services (PostgreSQL, Redis, Backend)..."
        docker-compose -f .\deploy\docker\docker-compose.yml up -d postgres redis
        
        # Wait for PostgreSQL to be ready
        Write-Status "Waiting for PostgreSQL to be ready..."
        $maxAttempts = 30
        $attempt = 1
        $isReady = $false
        
        while ($attempt -le $maxAttempts) {
            try {
                $result = docker-compose -f .\deploy\docker\docker-compose.yml exec -T postgres pg_isready -U salon_user
                if ($result -match "accepting connections") {
                    $isReady = $true
                    break
                }
            } catch {
                # Ignore errors and continue waiting
            }
            
            Write-Status "Waiting for PostgreSQL... (attempt $attempt/$maxAttempts)"
            Start-Sleep -Seconds 2
            $attempt++
        }
        
        if (-not $isReady) {
            throw "PostgreSQL failed to start within the expected time"
        }
        
        # Start backend
        docker-compose -f .\deploy\docker\docker-compose.yml up -d backend-dev
        
        Write-Success "All services started successfully!"
        
        # Show service status
        Show-ServiceStatus
        
    } catch {
        Write-Error "Failed to start services: $_"
        Write-Warning "Please check if Docker Desktop is running and try again."
        exit 1
    }
}

# Show service status
function Show-ServiceStatus {
    Write-Header "Service Status"
    
    Write-Host "${$colors.Cyan}Backend API:${$colors.NC}     http://localhost:3000"
    Write-Host "${$colors.Cyan}API Documentation:${$colors.NC} http://localhost:3000/api/docs"
    Write-Host "${$colors.Cyan}Health Check:${$colors.NC}    https://api.styleplusunit.com/api/v1/health"
    Write-Host ""
    Write-Host "${$colors.Cyan}Database:${$colors.NC}        localhost:5432"
    Write-Host "${$colors.Cyan}  - Host:${$colors.NC}        localhost"
    Write-Host "${$colors.Cyan}  - Port:${$colors.NC}        5432"
    Write-Host "${$colors.Cyan}  - Database:${$colors.NC}    salon_backend"
    Write-Host "${$colors.Cyan}  - Username:${$colors.NC}    salon_user"
    Write-Host "${$colors.Cyan}  - Password:${$colors.NC}    salon_password"
    Write-Host ""
    Write-Host "${$colors.Cyan}Redis:${$colors.NC}           localhost:6379"
    Write-Host ""
    Write-Host "${$colors.Yellow}To view logs, run: docker-compose -f .\deploy\docker\docker-compose.yml logs -f${$colors.NC}"
}

# Main execution
Write-Header "Salon Backend - Local Development Setup"

# Check if running as admin
if (-not (Test-Admin)) {
    Write-Error "This script requires Administrator privileges. Please run PowerShell as Administrator."
    exit 1
}

# Check Docker
if (-not (Test-DockerInstalled) -or -not (Test-DockerRunning)) {
    Write-Error "Docker is required but not running. Please install and start Docker Desktop first."
    Write-Host "Download Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Initialize environment
Initialize-Environment

# Start services
Start-Services

Write-Header "Setup Complete!"
Write-Host "${$colors.Green}✅ Your Salon Backend is now running!${$colors.NC}"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Access the API at: ${$colors.Cyan}http://localhost:3000${$colors.NC}"
Write-Host "2. View API docs at: ${$colors.Cyan}http://localhost:3000/api/docs${$colors.NC}"
Write-Host "3. Check logs with: ${$colors.Yellow}docker-compose -f .\deploy\docker\docker-compose.yml logs -f${$colors.NC}"
Write-Host ""
Write-Host "To stop the services, run: ${$colors.Yellow}docker-compose -f .\deploy\docker\docker-compose.yml down${$colors.NC}"
