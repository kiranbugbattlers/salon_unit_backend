# 💇 Salon Backend - Customer Onboarding API

A comprehensive NestJS backend for salon booking platform with customer onboarding, multi-factor authentication, and role-based access control.

## 🚀 Quick Start

**New to this project? Get running in 2 minutes:**

```bash
# One-command setup (requires Docker)
./setup-local-dev.sh setup

# Access your application
# 🌐 Backend API: http://localhost:3000
# 📚 API Documentation: http://localhost:3000/api/docs
```

**For detailed setup instructions, see [SETUP.md](SETUP.md)**
**For zip package recipients, see [ZIP-SHARE-INSTRUCTIONS.md](ZIP-SHARE-INSTRUCTIONS.md)**

## 🚀 Features

### 🔐 Authentication & Authorization
- **Multi-factor Authentication**: Phone OTP + Google OAuth
- **JWT Tokens**: Access & Refresh token mechanism
- **Role-based Access Control**: Customer & Business Owner roles
- **Phone Verification**: OTP via Twilio (swappable providers)

### 👤 Customer Onboarding
- **4-Step Progressive Onboarding**:
  1. Basic Info (25%) - Name, Email, Gender
  2. Address & Location (50%) - GPS coordinates, full address
  3. Service Preferences (75%) - Hair type, preferred services
  4. Timing Preferences (100%) - Preferred time slots
- **Real-time Progress Tracking**
- **Multiple Address Management**

### 🛠️ Technical Stack
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── auth.service.ts  # Auth business logic
│   └── auth.controller.ts # Auth endpoints
├── customer/            # Customer module  
│   ├── dto/             # Customer DTOs
│   ├── customer.service.ts
│   └── customer.controller.ts
├── common/              # Shared utilities
│   ├── enums/           # TypeScript enums
│   ├── guards/          # Auth guards
│   ├── decorators/      # Custom decorators
│   ├── strategies/      # Passport strategies
│   └── services/        # OTP service (Strategy pattern)
├── config/              # Configuration
├── database/            # Database entities
└── main.ts             # Application entry point
```

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone <repository-url>
cd salon-backend
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` file with your settings:
```env
# Database
DATABASE_USERNAME=salon_user
DATABASE_PASSWORD=salon_password
DATABASE_NAME=salon_backend

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### 3. Run with Docker (Recommended)

#### Development Mode
```bash
# Using our setup script (recommended)
./setup-local-dev.sh start

# Or manually with docker-compose
cd deploy/docker
docker-compose --profile dev up -d

# View logs
./setup-local-dev.sh logs
# OR: docker-compose -f deploy/docker/docker-compose.yml logs -f backend-dev

# Stop services
./setup-local-dev.sh stop
# OR: docker-compose -f deploy/docker/docker-compose.yml down
```

#### Production Mode
```bash
# Start production services with Nginx
cd deploy/docker
docker-compose --profile prod up -d

# With database management tools
docker-compose --profile prod --profile tools up -d
```

### 4. Manual Setup (Without Docker)
```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis locally
# Update .env with local database credentials

# Run development server
npm run start:dev
```

## 📚 API Documentation

### Development
- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api/v1

### Production  
- **Swagger UI**: http://localhost/api/docs
- **API Base URL**: http://localhost/api/v1

## 🔑 API Authentication

1. **Get JWT Token**:
   ```bash
   # Send OTP
   POST /api/v1/auth/send-otp
   {
     "phone": "9876543210"
   }

   # Verify OTP & Get Tokens
   POST /api/v1/auth/verify-otp  
   {
     "phone": "9876543210",
     "otp": "123456"
   }
   ```

2. **Use Token in Swagger**:
   - Click "Authorize" button in Swagger UI
   - Enter: `Bearer <your-access-token>`

3. **Test Protected Endpoints**:
   ```bash
   curl -H "Authorization: Bearer <token>" \\
        http://localhost:3000/api/v1/customer/profile
   ```

## 📱 Customer Onboarding Flow

### Step 1: Basic Information (25%)
```bash
POST /api/v1/customer/onboarding/step1
{
  "firstName": "John",
  "email": "john@example.com", 
  "gender": "male"
}
```

### Step 2: Address (50%)
```bash
POST /api/v1/customer/onboarding/step2
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "streetAddress": "123 Main Street",
  "addressLine1": "Apartment 4B",
  "city": "Delhi",
  "state": "Delhi",
  "postalCode": "110001"
}
```

### Step 3: Service Preferences (75%)
```bash
POST /api/v1/customer/onboarding/step3
{
  "hairType": "straight",
  "preferredServiceIds": ["uuid1", "uuid2"],
  "serviceCategory": "premium"
}
```

### Step 4: Timing Preferences (100%)
```bash
POST /api/v1/customer/onboarding/step4
{
  "preferredTimeSlotIds": ["uuid1", "uuid2"],
  "preferredDays": [1, 2, 3, 4, 5]
}
```

## 🐳 Docker Commands

```bash
# Using Setup Script (Recommended)
./setup-local-dev.sh setup                     # Complete first-time setup
./setup-local-dev.sh start                     # Start dev services
./setup-local-dev.sh stop                      # Stop services
./setup-local-dev.sh logs                      # View backend logs
./setup-local-dev.sh tools                     # Start pgAdmin
./setup-local-dev.sh cleanup                   # Stop and remove volumes

# Manual Docker Commands (from project root)
docker-compose -f deploy/docker/docker-compose.yml --profile dev up -d
docker-compose -f deploy/docker/docker-compose.yml --profile dev down
docker-compose -f deploy/docker/docker-compose.yml logs -f backend-dev

# Production
cd deploy/docker
docker-compose --profile prod up -d             # Start prod services
docker-compose --profile prod --profile tools up -d  # With pgAdmin
```

## 🔧 Development

### Available Scripts
```bash
npm run start          # Production mode
npm run start:dev      # Development with hot reload
npm run start:debug    # Debug mode
npm run build          # Build for production
npm run lint           # Run ESLint
npm run test           # Run tests
```

### Database Management

#### Access Database
```bash
# Via Docker
docker exec -it salon_postgres psql -U salon_user -d salon_backend

# Via pgAdmin (if running with --profile tools)
# http://localhost:5050
# Email: admin@salon.com, Password: admin123
```

#### Reset Database
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d postgres  # Restart with fresh DB
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Application port | `3000` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USERNAME` | DB username | `salon_user` |
| `DATABASE_PASSWORD` | DB password | `salon_password` |
| `DATABASE_NAME` | Database name | `salon_backend` |
| `JWT_SECRET` | JWT secret key | Required |
| `OTP_PROVIDER` | OTP provider | `console` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Optional |

## 🚦 Health Checks

- **Application**: `GET /api/v1/auth/profile` (with valid token)
- **Database**: Automatic health checks in Docker
- **Nginx**: `GET /health` 

## 🛡️ Security Features

- **CORS** enabled for cross-origin requests
- **Rate limiting** via Nginx
- **Input validation** with class-validator
- **JWT token** expiration and refresh
- **Password hashing** for sensitive data
- **Security headers** via Nginx

## 📊 Monitoring & Logs

```bash
# View application logs
docker-compose logs -f backend-dev

# View database logs  
docker-compose logs -f postgres

# View Nginx logs
docker-compose logs -f nginx
```

## 🔄 OTP Provider Configuration

The system supports multiple OTP providers using the Strategy pattern:

### Console Provider (Development)
```env
OTP_PROVIDER=console
```
OTPs are logged to console - perfect for development.

### Twilio Provider (Production)
```env
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token  
TWILIO_PHONE_NUMBER=your-twilio-number
```

### Adding Custom Providers
1. Implement `OtpProviderInterface`
2. Register in `AuthModule` providers
3. Update factory logic

## 📈 Performance

- **Database**: PostgreSQL with proper indexing
- **Caching**: Redis for sessions and temporary data
- **Connection Pooling**: Automatic via TypeORM
- **Rate Limiting**: 10 requests/second via Nginx

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Change ports in .env file
   APP_PORT=3001
   DATABASE_PORT=5433
   ```

2. **Database connection failed**:
   ```bash
   # Wait for DB to be ready
   docker-compose logs postgres
   
   # Reset database
   docker-compose down -v && docker-compose up -d
   ```

3. **OTP not working**:
   ```bash
   # Check logs for OTP codes (console provider)
   docker-compose logs -f backend-dev | grep OTP
   ```

## 📞 Support

For questions and support:
- Create an issue in the repository
- Check the Swagger documentation at `/api/docs`
- Review the logs: `docker-compose logs -f`

---

🎉 **Happy Coding!** Built with ❤️ using NestJS