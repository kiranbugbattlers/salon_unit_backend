import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { UrlNormalizationMiddleware } from './common/middleware/url-normalization.middleware';
import * as os from 'os';

async function bootstrap() {
  // Disable default NestJS logger for cleaner output
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const firstError = errors[0];
        const firstConstraint = Object.values(firstError.constraints || {})[0];
        return new BadRequestException(firstConstraint || 'Validation failed');
      },
    }),
  );



  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://styleplusunit.com',
      'https://admin.styleplusunit.com',
      'https://app.styleplusunit.com',
      'https://agent.styleplusunit.com',
      'http://localhost:3000',
      'http://142.93.220.120',
      'http://142.93.220.120:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: [
      'Authorization',
      'Content-Length',
      'X-Requested-With',
      'Content-Type'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  });

  // Add request logger middleware
  const requestLogger = new RequestLoggerMiddleware();
  app.use(requestLogger.use.bind(requestLogger));

  // Add URL normalization middleware to handle double slashes
  const urlNormalizer = new UrlNormalizationMiddleware();
  app.use((req, res, next) => urlNormalizer.use(req, res, next));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Salon Booking API')
    .setDescription(`
      ## Customer Onboarding & Authentication API
      
      Complete salon booking platform API with customer onboarding, authentication, and booking management.
      
      ### Authentication Flow:
      1. **Phone OTP**: Send OTP → Verify OTP → Get JWT tokens
      2. **Google OAuth**: Login with Google → Get JWT tokens
      
      ### Onboarding Steps:
      1. **Step 1**: Basic Info (name, email, gender) - 25%
      2. **Step 2**: Address & Location - 50% 
      3. **Step 3**: Hair Type & Service Preferences - 75%
      4. **Step 4**: Timing Preferences - 100%
      
      ### JWT Authentication:
      - Use the **Authorize** button below to add your JWT token
      - Format: \`Bearer <your-jwt-token>\`
      - Test protected endpoints with different user roles
      
      ### Features:
      - 🔐 Multi-factor authentication (Phone OTP + Google OAuth)
      - 📱 OTP service with Twilio integration (swappable providers)
      - 👤 Role-based access control (Customer, Business Owner)
      - 📊 Real-time onboarding progress tracking
      - 🗺️ Location-based address management
      - ⚡ JWT token refresh mechanism
      - 📱 Mobile-first API design
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Authentication', 'User authentication and token management')
    .addTag('Customer', 'Customer profile and onboarding management')
    .addTag('Service Categories', 'Service category management')
    .addTag('Services', 'Service management')
    .addTag('Genders', 'Gender management for services')
    .addServer('http://localhost:3000', 'Local Development server')
    .addServer('http://142.93.220.120:3000', 'Production server (IP)')
    .addServer('http://localhost:3000', 'Production server (Domain)')
    .addServer('https://bright-basilisk-abnormally.ngrok-free.app', 'Tunnel server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Salon Booking API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  // Get network interfaces for IP address
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    if (interfaces) {
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          localIP = iface.address;
          break;
        }
      }
    }
  }

  // Get database info
  const dbMode = configService.get('app.dbMode');
  const isSupabase = dbMode === 'supabase';
  const dbConfig = isSupabase
    ? configService.get('app.supabase.database')
    : configService.get('app.database');
  const environment = configService.get('app.environment');

  // Color codes
  const reset = '\x1b[0m';
  const green = '\x1b[32m';
  const cyan = '\x1b[36m';
  const yellow = '\x1b[33m';
  const magenta = '\x1b[35m';
  const bold = '\x1b[1m';

  console.log('\n');
  console.log(`${bold}${green}╔════════════════════════════════════════════════════════════════╗${reset}`);
  console.log(`${bold}${green}║${reset}           ${bold}� STYLE PLUS BACKEND SERVER STARTED${reset}              ${bold}${green}║${reset}`);
  console.log(`${bold}${green}╠════════════════════════════════════════════════════════════════╣${reset}`);
  console.log(`${bold}${green}║${reset}                                                                ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}  ${cyan}Environment:${reset}  ${yellow}${environment}${reset}                                       ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}                                                                ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}  ${cyan}Server:${reset}                                                     ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Local:    ${magenta}http://localhost:${port}${reset}                         ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Network:  ${magenta}http://${localIP}:${port}${reset}                      ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}                                                                ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}  ${cyan}Database:${reset}                                                   ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Mode:     ${yellow}${isSupabase ? 'Supabase' : 'Local PostgreSQL'}${reset}                              ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Host:     ${magenta}${dbConfig?.host || 'N/A'}${reset}              ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Port:     ${magenta}${dbConfig?.port || 'N/A'}${reset}                                      ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Database: ${magenta}${dbConfig?.database || 'N/A'}${reset}                                  ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}    • Status:   ${green}✓ Connected${reset}                                   ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}                                                                ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}  ${cyan}API Docs:${reset}     ${magenta}http://localhost:${port}/api/docs${reset}                 ${bold}${green}║${reset}`);
  console.log(`${bold}${green}║${reset}                                                                ${bold}${green}║${reset}`);
  console.log(`${bold}${green}╚════════════════════════════════════════════════════════════════╝${reset}`);
  console.log('\n');
  console.log(`${cyan}API Requests:${reset}`);
  console.log(`${cyan}─────────────${reset}`);
}

bootstrap();