import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import {
  User,
  UserRole,
  Customer,
  CustomerOnboarding,
  BusinessOwner,
  BusinessOwnerOnboarding,
  RefreshToken,
  Admin,
  Agent,
  Wallet,
  WalletTransaction,
  CustomerRewardPoints,
  CustomerFavorite,
  Booking,
  BookingService,
  BookingRequest,
  BookingRequestService,
  Payment,
  CommissionTransaction,
  UserAddress,
  Staff,
  StaffService,
  StaffScheduleOverride,
  StaffBreak,
  StaffWorkingHours,
  BusinessService,
  ServicePackage,
  ServicePackageItem,
  MonthlySettlement,
  SettlementTransaction,
  CommissionPayment,
  CODTransaction,
  BankingInfo,
  BusinessMedia,
  BusinessOperatingHours,
  BusinessSettings,
  BusinessSubscription,
  SubscriptionTransaction,
  BusinessAddress,
  BusinessApproval,
} from '../database/entities';
import { UserRole as UserRoleEnum } from '../common/enums';
import { OtpService } from '../common/services/otp/otp.service';
import { NotificationService } from '../notification/notification.service';
import { S3Service } from '../common/services/s3.service';
import {
  AuthResponseDto,
  OnboardingStatusDto,
  UserDto,
  TokensDto,
  FcmTokenDto,
  AdminLoginDto,
  AdminAuthResponseDto,
  AdminDto,
  AgentLoginDto,
  AgentAuthResponseDto,
  CreateAgentDto,
  UpdateAgentDto,
  AgentDto,
  AgentListResponseDto,
  AgentCreateResponseDto,
} from './dto';
import { SendOtpResponseDto, VerifyOtpResponseDto, ApiResponseDto } from '../common/dto/api-response.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private notificationService: NotificationService,
    private s3Service: S3Service,
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerOnboarding)
    private customerOnboardingRepository: Repository<CustomerOnboarding>,
    @InjectRepository(BusinessOwner)
    private businessOwnerRepository: Repository<BusinessOwner>,
    @InjectRepository(BusinessOwnerOnboarding)
    private businessOwnerOnboardingRepository: Repository<BusinessOwnerOnboarding>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    @InjectRepository(CustomerRewardPoints)
    private customerRewardPointsRepository: Repository<CustomerRewardPoints>,
    @InjectRepository(CustomerFavorite)
    private customerFavoriteRepository: Repository<CustomerFavorite>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingService)
    private bookingServiceRepository: Repository<BookingService>,
    @InjectRepository(BookingRequest)
    private bookingRequestRepository: Repository<BookingRequest>,
    @InjectRepository(BookingRequestService)
    private bookingRequestServiceRepository: Repository<BookingRequestService>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(CommissionTransaction)
    private commissionTransactionRepository: Repository<CommissionTransaction>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(BusinessService)
    private businessServiceRepository: Repository<BusinessService>,
    @InjectRepository(ServicePackage)
    private servicePackageRepository: Repository<ServicePackage>,
    @InjectRepository(BankingInfo)
    private bankingInfoRepository: Repository<BankingInfo>,
    @InjectRepository(BusinessMedia)
    private businessMediaRepository: Repository<BusinessMedia>,
    @InjectRepository(BusinessOperatingHours)
    private businessOperatingHoursRepository: Repository<BusinessOperatingHours>,
    @InjectRepository(BusinessSettings)
    private businessSettingsRepository: Repository<BusinessSettings>,
    @InjectRepository(BusinessSubscription)
    private businessSubscriptionRepository: Repository<BusinessSubscription>,
    @InjectRepository(BusinessAddress)
    private businessAddressRepository: Repository<BusinessAddress>,
    @InjectRepository(BusinessApproval)
    private businessApprovalRepository: Repository<BusinessApproval>,
    @InjectRepository(MonthlySettlement)
    private monthlySettlementRepository: Repository<MonthlySettlement>,
    @InjectRepository(SettlementTransaction)
    private settlementTransactionRepository: Repository<SettlementTransaction>,
    @InjectRepository(CommissionPayment)
    private commissionPaymentRepository: Repository<CommissionPayment>,
    @InjectRepository(CODTransaction)
    private codTransactionRepository: Repository<CODTransaction>,
  ) {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('app.google.clientId'),
    );
  }

  async sendOtp(phone: string, role: UserRoleEnum): Promise<SendOtpResponseDto> {
    // Admin and Agent roles cannot use phone OTP - they have special authentication methods
    if (role === UserRoleEnum.ADMIN) {
      throw new BadRequestException('Admin role cannot use phone OTP authentication. Please use admin login.');
    }
    
    if (role === UserRoleEnum.AGENT) {
      throw new BadRequestException('Agent role cannot use phone OTP authentication. Agents are created and managed by admins.');
    }

    const normalizedPhone = this.normalizePhoneNumber(phone);
    
    const success = await this.otpService.generateAndSendOtp(normalizedPhone, role);
    
    if (!success) {
      throw new BadRequestException('Failed to send OTP');
    }
    
    return new SendOtpResponseDto();
  }

  async verifyOtpAndAuth(phone: string, otp: string, role: UserRoleEnum): Promise<VerifyOtpResponseDto<AuthResponseDto>> {
    // Admin and Agent roles cannot use phone OTP - they have special authentication methods
    if (role === UserRoleEnum.ADMIN) {
      throw new BadRequestException('Admin role cannot use phone OTP authentication. Please use admin login.');
    }
    
    if (role === UserRoleEnum.AGENT) {
      throw new BadRequestException('Agent role cannot use phone OTP authentication. Agents are created and managed by admins.');
    }

    const normalizedPhone = this.normalizePhoneNumber(phone);
    
    const isValidOtp = await this.otpService.verifyOtp(normalizedPhone, otp, role);
    
    if (!isValidOtp) {
      await this.otpService.incrementAttempts(normalizedPhone, otp);
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.userRepository.findOne({
      where: { phone: normalizedPhone },
      relations: ['roles'],
    });

    let isNewUser = false;
    
    // Create user if doesn't exist (sign up)
    if (!user) {
      user = await this.createNewUser(normalizedPhone, role);
      isNewUser = true;
    } else {
      // For existing users, check if they need the requested role
      const existingRoles = user.roles.map(r => r.role);
      if (!existingRoles.includes(role)) {
        await this.addRoleToUser(user.id, role);
        // Refresh user data with new role
        user = await this.userRepository.findOne({
          where: { phone: normalizedPhone },
          relations: ['roles'],
        });
      }
    }

    // Mark phone as verified
    if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      await this.userRepository.save(user);
    }

    const authData = await this.buildAuthResponse(user, isNewUser, role);
    return new VerifyOtpResponseDto(200, true, 'OTP verified successfully', authData);
  }

  async googleSignIn(idToken: string, role: UserRoleEnum): Promise<VerifyOtpResponseDto<AuthResponseDto>> {
    // Admin and Agent roles cannot use Google sign-in
    if (role === UserRoleEnum.ADMIN) {
      throw new BadRequestException('Admin role cannot use Google sign-in. Please use admin login.');
    }

    if (role === UserRoleEnum.AGENT) {
      throw new BadRequestException('Agent role cannot use Google sign-in. Agents are created and managed by admins.');
    }

    try {
      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('app.google.clientId'),
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google ID token - missing email');
      }

      const { email, name, picture } = payload;

      // Find user by email
      let user = await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });

      let isNewUser = false;

      // Create user if doesn't exist (sign up)
      if (!user) {
        user = await this.createNewGoogleUser(email, name, picture, role);
        isNewUser = true;
      } else {
        // For existing users, check if they need the requested role
        const existingRoles = user.roles.map(r => r.role);
        if (!existingRoles.includes(role)) {
          await this.addRoleToUser(user.id, role);
          // Refresh user data with new role
          user = await this.userRepository.findOne({
            where: { email },
            relations: ['roles'],
          });
        }
      }

      // Mark email as verified (similar to how OTP marks phone as verified)
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await this.userRepository.save(user);
      }

      const authData = await this.buildAuthResponse(user, isNewUser, role);
      return new VerifyOtpResponseDto(200, true, 'Google sign-in successful', authData);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired Google ID token');
    }
  }

  private async createNewGoogleUser(email: string, name: string | undefined, picture: string | undefined, role: UserRoleEnum): Promise<User> {
    // Create user with Google data
    const user = this.userRepository.create({
      phone: '', // Will be filled during onboarding
      email,
      profilePic: picture,
      isEmailVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Add the requested role to user
    await this.addRoleToUser(savedUser.id, role);

    // If name was provided, update the profile
    if (name && role === UserRoleEnum.CUSTOMER) {
      const customer = await this.customerRepository.findOne({
        where: { userId: savedUser.id },
      });
      if (customer && !customer.firstName) {
        customer.firstName = name;
        await this.customerRepository.save(customer);
      }
    } else if (name && role === UserRoleEnum.BUSINESS_OWNER) {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { userId: savedUser.id },
      });
      if (businessOwner && !businessOwner.firstName) {
        businessOwner.firstName = name;
        await this.businessOwnerRepository.save(businessOwner);
      }
    }

    return savedUser;
  }

  async refreshToken(refreshToken: string): Promise<TokensDto> {
    // Get all non-revoked, non-expired refresh tokens
    const tokenRecords = await this.refreshTokenRepository.find({
      where: { 
        isRevoked: false,
        expiresAt: MoreThan(new Date())
      },
      relations: ['user'],
    });

    // Find the token record that matches the provided refresh token
    let tokenRecord = null;
    for (const record of tokenRecords) {
      if (await bcrypt.compare(refreshToken, record.tokenHash)) {
        tokenRecord = record;
        break;
      }
    }

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = tokenRecord.user;
    const roles = await this.userRoleRepository.find({
      where: { userId: user.id, isActive: true },
    });

    const tokens = await this.generateTokens(user, roles.map(r => r.role));
    
    // Revoke old refresh token
    tokenRecord.isRevoked = true;
    await this.refreshTokenRepository.save(tokenRecord);

    return tokens;
  }

  async logout(userId: string): Promise<ApiResponseDto> {
    // Revoke all refresh tokens for the user
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );

    // Clear FCM token for push notifications (legacy system)
    await this.userRepository.update(userId, { fcmToken: null });

    // Deactivate all device tokens for the user (new notification system)
    await this.notificationService.deactivateAllUserTokens(userId);

    return new ApiResponseDto(200, true, 'Logged out successfully');
  }

  private async createNewUser(phone: string, role: UserRoleEnum): Promise<User> {
    const user = this.userRepository.create({
      phone,
      isPhoneVerified: true,
    });
    
    const savedUser = await this.userRepository.save(user);
    
    // Add the requested role to user
    await this.addRoleToUser(savedUser.id, role);
    
    return savedUser;
  }

  private async addRoleToUser(userId: string, role: UserRoleEnum): Promise<void> {
    // Admin and Agent roles cannot be assigned to regular users - they are managed separately
    if (role === UserRoleEnum.ADMIN) {
      throw new BadRequestException('Admin role cannot be assigned through this method. Admins are managed separately.');
    }
    
    if (role === UserRoleEnum.AGENT) {
      throw new BadRequestException('Agent role cannot be assigned through this method. Agents are created and managed by admins.');
    }

    // Check if user has any existing roles
    const existingRoles = await this.userRoleRepository.find({
      where: { userId, isActive: true },
    });

    // Check if the specific role already exists
    const existingRole = existingRoles.find(r => r.role === role);
    if (existingRole) {
      return; // Role already exists
    }

    // Check if user is trying to get admin or agent role (which is not allowed)
    const hasAdminRole = existingRoles.some(r => r.role === UserRoleEnum.ADMIN);
    const hasAgentRole = existingRoles.some(r => r.role === UserRoleEnum.AGENT);
    
    if (hasAdminRole) {
      throw new BadRequestException('Admin users cannot have other roles.');
    }
    
    if (hasAgentRole) {
      throw new BadRequestException('Agent users cannot have other roles.');
    }

    // Create user role
    const userRole = this.userRoleRepository.create({
      userId,
      role,
    });
    await this.userRoleRepository.save(userRole);

    // Create role-specific profile and onboarding
    if (role === UserRoleEnum.CUSTOMER) {
      await this.createCustomerProfile(userId);
    } else if (role === UserRoleEnum.BUSINESS_OWNER) {
      await this.createBusinessOwnerProfile(userId);
    }
    // Business owner role doesn't need additional profiles for now
  }

  private async createCustomerProfile(userId: string): Promise<void> {
    // Check if customer profile already exists
    const existingCustomer = await this.customerRepository.findOne({
      where: { userId },
    });

    if (existingCustomer) {
      return; // Profile already exists
    }

    // Create customer profile
    const customer = this.customerRepository.create({
      userId,
    });
    const savedCustomer = await this.customerRepository.save(customer);
    
    // Create onboarding record
    const existingOnboarding = await this.customerOnboardingRepository.findOne({
      where: { customerId: savedCustomer.id },
    });

    if (!existingOnboarding) {
      const onboarding = this.customerOnboardingRepository.create({
        customerId: savedCustomer.id,
        currentStep: 1,
      });
      await this.customerOnboardingRepository.save(onboarding);
    }
  }

  private async createBusinessOwnerProfile(userId: string): Promise<void> {
    // Check if business owner profile already exists
    const existingBusinessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (existingBusinessOwner) {
      return; // Profile already exists
    }

    // Create business owner profile
    const businessOwner = this.businessOwnerRepository.create({
      userId,
    });
    const savedBusinessOwner = await this.businessOwnerRepository.save(businessOwner);
    
    // Create onboarding record
    const existingOnboarding = await this.businessOwnerOnboardingRepository.findOne({
      where: { businessOwnerId: savedBusinessOwner.id },
    });

    if (!existingOnboarding) {
      const onboarding = this.businessOwnerOnboardingRepository.create({
        businessOwnerId: savedBusinessOwner.id,
        currentStep: 1,
      });
      await this.businessOwnerOnboardingRepository.save(onboarding);
    }
  }

  private async buildAuthResponse(user: User, isNewUser: boolean, requestedRole: UserRoleEnum): Promise<AuthResponseDto> {
    // Get user roles
    const roles = await this.userRoleRepository.find({
      where: { userId: user.id, isActive: true },
    });
    const roleNames = roles.map(r => r.role);

    // Generate tokens with all roles for proper authorization
    const tokens = await this.generateTokens(user, roleNames);

    // Build role-specific response based on requested role
    const onboardingStatus: OnboardingStatusDto = {};
    let name: string | undefined;

    if (requestedRole === UserRoleEnum.CUSTOMER) {
      // Only return customer data
      let customer = await this.customerRepository.findOne({
        where: { userId: user.id },
        relations: ['onboarding'],
      });

      // If customer profile doesn't exist but user has customer role, create it
      if (!customer) {
        await this.createCustomerProfile(user.id);
        customer = await this.customerRepository.findOne({
          where: { userId: user.id },
          relations: ['onboarding'],
        });
      }

      if (customer) {
        onboardingStatus.customer = {
          isRequired: true,
          isCompleted: customer.onboarding?.isCompleted || false,
          currentStep: customer.onboarding?.currentStep || 1,
          completedSteps: customer.onboarding?.completedSteps || [],
          progressPercentage: customer.onboarding?.getProgressPercentage() || 0,
          stepData: {
            step1: customer.onboarding?.step1Data || {},
            step2: customer.onboarding?.step2Data || {},
            step3: customer.onboarding?.step3Data || {},
            step4: customer.onboarding?.step4Data || {},
          },
        };
        name = customer.firstName;
      }
    } else if (requestedRole === UserRoleEnum.BUSINESS_OWNER) {
      // Only return business owner data
      let businessOwner = await this.businessOwnerRepository.findOne({
        where: { userId: user.id },
        relations: ['onboarding'],
      });

      // If business owner profile doesn't exist but user has business owner role, create it
      if (!businessOwner) {
        await this.createBusinessOwnerProfile(user.id);
        businessOwner = await this.businessOwnerRepository.findOne({
          where: { userId: user.id },
          relations: ['onboarding'],
        });
      }

      if (businessOwner) {
        onboardingStatus.businessOwner = {
          isRequired: true,
          isCompleted: businessOwner.onboarding?.isCompleted || false,
          currentStep: businessOwner.onboarding?.currentStep || 1,
          completedSteps: businessOwner.onboarding?.completedSteps || [],
          progressPercentage: businessOwner.onboarding?.getProgressPercentage() || 0,
          stepData: {
            step1: businessOwner.onboarding?.step1Data || {},
            step2: businessOwner.onboarding?.step2Data || {},
            step3: businessOwner.onboarding?.step3Data || {},
            step4: businessOwner.onboarding?.step4Data || {},
          },
        };
        name = businessOwner.firstName;
      }
    }

    const userDto: UserDto = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      profilePic: user.profilePic,
      name,
      roles: [requestedRole], // Only return the requested role in response
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
    };

    return {
      user: userDto,
      onboarding: onboardingStatus,
      tokens,
      isNewUser,
    };
  }

  private async generateTokens(user: User, roles: string[]): Promise<TokensDto> {
    const payload = {
      sub: user.id,
      phone: user.phone,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.accessTokenExpiry') as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.refreshTokenExpiry') as StringValue,
    });

    // Save refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const tokenRecord = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    await this.refreshTokenRepository.save(tokenRecord);

    return { accessToken, refreshToken };
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned.substring(2); // Remove +91 or 91 prefix
    }
    
    if (cleaned.length === 10) {
      return cleaned;
    }
    
    throw new BadRequestException('Invalid phone number format');
  }

  async updateFcmToken(userId: string, fcmTokenDto: FcmTokenDto): Promise<ApiResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update user's FCM token and device info
    await this.userRepository.update(userId, {
      fcmToken: fcmTokenDto.fcmToken,
      deviceType: fcmTokenDto.deviceType,
      deviceId: fcmTokenDto.deviceId,
    });

    return new ApiResponseDto(200, true, 'FCM token updated successfully');
  }

  async adminLogin(adminLoginDto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    const { username, password } = adminLoginDto;

    // Find admin by username
    const admin = await this.adminRepository.findOne({
      where: { username, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Validate password
    const isPasswordValid = await admin.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Update last login
    admin.lastLogin = new Date();
    await this.adminRepository.save(admin);

    // Generate tokens for admin
    const payload = {
      sub: admin.id,
      username: admin.username,
      roles: [UserRoleEnum.ADMIN],
      type: 'admin',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.accessTokenExpiry') as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.refreshTokenExpiry') as StringValue,
    });

    // Build admin DTO
    const adminDto: AdminDto = {
      id: admin.id,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      fullName: admin.fullName,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      role: UserRoleEnum.ADMIN,
    };

    const tokens: TokensDto = { accessToken, refreshToken };

    return {
      admin: adminDto,
      tokens,
      isNewLogin: !admin.lastLogin || admin.lastLogin.getTime() === new Date().getTime(),
    };
  }

  async agentLogin(agentLoginDto: AgentLoginDto): Promise<AgentAuthResponseDto> {
    const { username, password } = agentLoginDto;

    // Find agent by username
    const agent = await this.agentRepository.findOne({
      where: { username, isActive: true },
      relations: ['user', 'createdByAdmin'],
    });

    if (!agent) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Validate password
    const isPasswordValid = await agent.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Update last login
    agent.lastLogin = new Date();
    await this.agentRepository.save(agent);

    // Generate tokens for agent
    const payload = {
      sub: agent.id,
      username: agent.username,
      roles: [UserRoleEnum.AGENT],
      type: 'agent',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.accessTokenExpiry') as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('app.jwt.refreshTokenExpiry') as StringValue,
    });

    // Build agent DTO
    const agentDto = this.buildAgentDto(agent);

    const tokens: TokensDto = { accessToken, refreshToken };

    return {
      agent: agentDto,
      tokens,
      isNewLogin: !agent.lastLogin || agent.lastLogin.getTime() === new Date().getTime(),
    };
  }

  async createAgent(createAgentDto: CreateAgentDto, adminId: string): Promise<AgentCreateResponseDto> {
    const normalizedPhone = this.normalizePhoneNumber(createAgentDto.phone);

    // Check if user with this phone already exists
    const existingUser = await this.userRepository.findOne({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Check if username is unique
    const existingAgent = await this.agentRepository.findOne({
      where: { username: createAgentDto.username },
    });

    if (existingAgent) {
      throw new ConflictException('Agent with this username already exists');
    }

    // Check if employee ID is unique (if provided)
    if (createAgentDto.employeeId) {
      const existingAgentByEmployeeId = await this.agentRepository.findOne({
        where: { employeeId: createAgentDto.employeeId },
      });
      if (existingAgentByEmployeeId) {
        throw new ConflictException('Agent with this employee ID already exists');
      }
    }

    // Create user account
    const user = this.userRepository.create({
      phone: normalizedPhone,
      email: createAgentDto.email,
      isPhoneVerified: true, // Agents are pre-verified
      isEmailVerified: !!createAgentDto.email,
    });
    const savedUser = await this.userRepository.save(user);

    // Create agent role
    const userRole = this.userRoleRepository.create({
      userId: savedUser.id,
      role: UserRoleEnum.AGENT,
    });
    await this.userRoleRepository.save(userRole);

    // Create agent profile
    const agent = this.agentRepository.create({
      userId: savedUser.id,
      createdByAdminId: adminId,
      username: createAgentDto.username,
      password: createAgentDto.password,
      firstName: createAgentDto.firstName,
      lastName: createAgentDto.lastName,
      gender: createAgentDto.gender,
      dateOfBirth: createAgentDto.dateOfBirth ? new Date(createAgentDto.dateOfBirth) : undefined,
      employeeId: createAgentDto.employeeId,
      department: createAgentDto.department,
      position: createAgentDto.position,
      hireDate: createAgentDto.hireDate ? new Date(createAgentDto.hireDate) : undefined,
      salary: createAgentDto.salary,
      permissions: createAgentDto.permissions,
      notes: createAgentDto.notes,
      locationAddress: createAgentDto.locationAddress,
      latitude: createAgentDto.latitude,
      longitude: createAgentDto.longitude,
    });
    const savedAgent = await this.agentRepository.save(agent);

    // Get agent with relations for response
    const agentWithRelations = await this.agentRepository.findOne({
      where: { id: savedAgent.id },
      relations: ['user', 'createdByAdmin'],
    });

    const agentDto = this.buildAgentDto(agentWithRelations);

    return {
      agent: agentDto,
      message: 'Agent created successfully',
    };
  }

  async updateAgent(agentId: string, updateAgentDto: UpdateAgentDto, adminId: string): Promise<AgentDto> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['user', 'createdByAdmin'],
    });

    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    // Check if employee ID is unique (if provided and different)
    if (updateAgentDto.employeeId && updateAgentDto.employeeId !== agent.employeeId) {
      const existingAgent = await this.agentRepository.findOne({
        where: { employeeId: updateAgentDto.employeeId },
      });
      if (existingAgent && existingAgent.id !== agentId) {
        throw new ConflictException('Agent with this employee ID already exists');
      }
    }

    // Update agent
    Object.assign(agent, {
      firstName: updateAgentDto.firstName ?? agent.firstName,
      lastName: updateAgentDto.lastName ?? agent.lastName,
      gender: updateAgentDto.gender ?? agent.gender,
      dateOfBirth: updateAgentDto.dateOfBirth ? new Date(updateAgentDto.dateOfBirth) : agent.dateOfBirth,
      employeeId: updateAgentDto.employeeId ?? agent.employeeId,
      department: updateAgentDto.department ?? agent.department,
      position: updateAgentDto.position ?? agent.position,
      hireDate: updateAgentDto.hireDate ? new Date(updateAgentDto.hireDate) : agent.hireDate,
      salary: updateAgentDto.salary ?? agent.salary,
      isActive: updateAgentDto.isActive ?? agent.isActive,
      permissions: updateAgentDto.permissions ?? agent.permissions,
      notes: updateAgentDto.notes ?? agent.notes,
      locationAddress: updateAgentDto.locationAddress ?? agent.locationAddress,
      latitude: updateAgentDto.latitude ?? agent.latitude,
      longitude: updateAgentDto.longitude ?? agent.longitude,
    });

    const updatedAgent = await this.agentRepository.save(agent);
    return this.buildAgentDto(updatedAgent);
  }

  async getAgent(agentId: string): Promise<AgentDto> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['user', 'createdByAdmin'],
    });

    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    return this.buildAgentDto(agent);
  }

  async getAgents(page: number = 1, limit: number = 10, isActive?: boolean): Promise<AgentListResponseDto> {
    const queryBuilder = this.agentRepository
      .createQueryBuilder('agent')
      .leftJoinAndSelect('agent.user', 'user')
      .leftJoinAndSelect('agent.createdByAdmin', 'createdByAdmin');

    if (isActive !== undefined) {
      queryBuilder.where('agent.isActive = :isActive', { isActive });
    }

    const [agents, total] = await queryBuilder
      .orderBy('agent.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      agents: agents.map(agent => this.buildAgentDto(agent)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteAgent(agentId: string): Promise<{ message: string }> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['user'],
    });

    if (!agent) {
      throw new BadRequestException('Agent not found');
    }

    // Soft delete by deactivating
    agent.isActive = false;
    await this.agentRepository.save(agent);

    // Also deactivate user role
    await this.userRoleRepository.update(
      { userId: agent.userId, role: UserRoleEnum.AGENT },
      { isActive: false }
    );

    return { message: 'Agent deactivated successfully' };
  }

  async deleteAccount(userId: string): Promise<ApiResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get user with roles
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const roles = user.roles.map(r => r.role);
      const isCustomer = roles.includes(UserRoleEnum.CUSTOMER);
      const isBusinessOwner = roles.includes(UserRoleEnum.BUSINESS_OWNER);

      // Delete S3 files for user profile picture
      if (user.profilePicS3Key) {
        try {
          await this.s3Service.deleteFile(user.profilePicS3Key);
        } catch (error) {
          console.error('Failed to delete user profile picture from S3:', error);
        }
      }

      // Get wallet first (needed for multiple deletions)
      const wallet = await this.walletRepository.findOne({ where: { userId } });

      // Delete wallet transactions BEFORE payments (wallet_transactions references payments)
      // but AFTER we would delete commission_transactions... but commission_transactions reference wallet_transactions
      // So we need to delete commission transactions first

      // Delete customer-specific data (includes commission transactions and payments)
      if (isCustomer) {
        await this.deleteCustomerData(userId, queryRunner, wallet?.id);
      }

      // Delete business owner-specific data (includes commission transactions and payments)
      if (isBusinessOwner) {
        await this.deleteBusinessOwnerData(userId, queryRunner, wallet?.id);
      }

      // Delete common user data (device tokens and notifications will cascade)
      await queryRunner.manager.delete(UserAddress, { userId });
      await queryRunner.manager.delete(RefreshToken, { userId });
      await queryRunner.manager.delete(UserRole, { userId });

      // Delete ALL remaining wallet transactions for this user's wallet (catch-all for any missed ones)
      // Use raw SQL to ensure we catch all wallet_transactions for wallets belonging to this user
      await queryRunner.query(
        `DELETE FROM wallet_transactions WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id = $1)`,
        [userId]
      );

      // Delete wallet (after wallet transactions) - use userId to ensure we find it
      await queryRunner.manager.delete(Wallet, { userId });

      // Finally delete the user (this will cascade delete Agent, DeviceToken, NotificationLog)
      await queryRunner.manager.delete(User, { id: userId });

      await queryRunner.commitTransaction();

      return new ApiResponseDto(200, true, 'Account deleted successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivateAccount(userId: string): Promise<ApiResponseDto> {
    // Get user with roles
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const roles = user.roles.map(r => r.role);
    const isCustomer = roles.includes(UserRoleEnum.CUSTOMER);
    const isBusinessOwner = roles.includes(UserRoleEnum.BUSINESS_OWNER);

    // Reset customer onboarding and approval if user is a customer
    if (isCustomer) {
      const customer = await this.customerRepository.findOne({
        where: { userId },
      });

      if (customer) {
        // Reset customer onboarding
        const customerOnboarding = await this.customerOnboardingRepository.findOne({
          where: { customerId: customer.id },
        });

        if (customerOnboarding) {
          await this.customerOnboardingRepository.update(customerOnboarding.id, {
            isCompleted: false,
            currentStep: 1,
            completedSteps: [],
            step1Data: null,
            step2Data: null,
            step3Data: null,
            step4Data: null,
          });
        }
      }
    }

    // Reset business owner onboarding if user is a business owner
    if (isBusinessOwner) {
      const businessOwner = await this.businessOwnerRepository.findOne({
        where: { userId },
      });

      if (businessOwner) {
        // Reset business owner onboarding
        const businessOnboarding = await this.businessOwnerOnboardingRepository.findOne({
          where: { businessOwnerId: businessOwner.id },
        });

        if (businessOnboarding) {
          await this.businessOwnerOnboardingRepository.update(businessOnboarding.id, {
            isCompleted: false,
            currentStep: 1,
            completedSteps: [],
            step1Data: null,
            step2Data: null,
            step3Data: null,
            step4Data: null,
          });
        }
      }
    }

    // Invalidate all refresh tokens to log the user out
    await this.refreshTokenRepository.delete({ userId });

    return new ApiResponseDto(200, true, 'Account deleted successfully');
  }

  private async deleteCustomerData(userId: string, queryRunner: any, walletId?: string): Promise<void> {
    // Find customer record
    const customer = await this.customerRepository.findOne({
      where: { userId },
    });

    if (!customer) {
      return;
    }

    const customerId = customer.id;

    // Delete customer reward points
    await queryRunner.manager.delete(CustomerRewardPoints, { customerId });

    // Delete customer favorites (will cascade on both customer and business owner)
    await queryRunner.manager.delete(CustomerFavorite, { customerId });

    // SIMPLER APPROACH: Break all circular/nullable foreign key references first
    // This allows us to delete in a simpler order without complex dependency tracking

    // Break reference: bookings.commissionTransactionId -> commission_transactions.id
    await queryRunner.manager.update(Booking, { customerId }, { commissionTransactionId: null });

    // Break circular reference: booking_requests.paymentId -> payments.id
    await queryRunner.manager.update(BookingRequest, { customerId }, { paymentId: null });

    // Break reference: wallet_transactions.paymentId -> payments.id
    // IMPORTANT: We need to break ALL wallet_transaction references to this customer's payments,
    // not just the customer's own wallet (business owners' wallets might also reference these payments)
    await queryRunner.query(
      `UPDATE wallet_transactions SET payment_id = NULL
       WHERE payment_id IN (SELECT id FROM payments WHERE customer_id = $1)`,
      [customerId]
    );

    // Break reference: wallet_transactions.bookingId -> bookings.id
    // IMPORTANT: Break ALL wallet_transaction references to this customer's bookings
    await queryRunner.query(
      `UPDATE wallet_transactions SET booking_id = NULL
       WHERE booking_id IN (SELECT id FROM bookings WHERE customer_id = $1)`,
      [customerId]
    );

    // Break reference: commission_transactions -> wallet_transactions
    await queryRunner.manager.update(
      CommissionTransaction,
      { customerId },
      {
        businessOwnerWalletTransactionId: null,
        customerWalletTransactionId: null
      }
    );

    // Now delete in simpler order since FK constraints are broken
    await queryRunner.manager.delete(CommissionTransaction, { customerId });
    if (walletId) {
      await queryRunner.manager.delete(WalletTransaction, { walletId });
    }
    await queryRunner.manager.delete(Payment, { customerId });

    // Break reference: bookings.bookingRequestId -> booking_requests.id
    await queryRunner.manager.update(Booking, { customerId }, { bookingRequestId: null });

    // Delete COD transactions that reference this customer's bookings (COD transactions are non-nullable FK)
    await queryRunner.query(
      `DELETE FROM cod_transactions WHERE booking_id IN (SELECT id FROM bookings WHERE customer_id = $1)`,
      [customerId]
    );

    // Delete bookings as customer FIRST (before booking requests, since we broke the FK)
    const customerBookings = await this.bookingRepository.find({
      where: { customerId },
    });

    for (const booking of customerBookings) {
      await queryRunner.manager.delete(BookingService, { bookingId: booking.id });
      await queryRunner.manager.delete(Booking, { id: booking.id });
    }

    // Delete booking requests as customer (after bookings)
    const customerBookingRequests = await this.bookingRequestRepository.find({
      where: { customerId },
    });

    for (const request of customerBookingRequests) {
      await queryRunner.manager.delete(BookingRequestService, { bookingRequestId: request.id });
      await queryRunner.manager.delete(BookingRequest, { id: request.id });
    }

    // Delete customer onboarding
    await queryRunner.manager.delete(CustomerOnboarding, { customerId });

    // Delete customer record
    await queryRunner.manager.delete(Customer, { id: customerId });
  }

  private async deleteBusinessOwnerData(userId: string, queryRunner: any, walletId?: string): Promise<void> {
    // Find business owner record
    const businessOwner = await this.businessOwnerRepository.findOne({
      where: { userId },
    });

    if (!businessOwner) {
      return;
    }

    const businessOwnerId = businessOwner.id;

    // Delete staff and related entities
    const staffMembers = await this.staffRepository.find({
      where: { businessOwnerId },
    });

    for (const staff of staffMembers) {
      // Delete S3 files for staff profile pictures
      if (staff.profilePicS3Key) {
        try {
          await this.s3Service.deleteFile(staff.profilePicS3Key);
        } catch (error) {
          console.error('Failed to delete staff profile picture from S3:', error);
        }
      }

      // Delete staff-related records
      await queryRunner.manager.delete(StaffService, { staffId: staff.id });
      await queryRunner.manager.delete(StaffScheduleOverride, { staffId: staff.id });
      await queryRunner.manager.delete(StaffBreak, { staffId: staff.id });
      await queryRunner.manager.delete(StaffWorkingHours, { staffId: staff.id });
      await queryRunner.manager.delete(Staff, { id: staff.id });
    }

    // Delete service packages and items
    const servicePackages = await this.servicePackageRepository.find({
      where: { businessOwnerId },
    });

    for (const pkg of servicePackages) {
      await queryRunner.manager.delete(ServicePackageItem, { packageId: pkg.id });
      await queryRunner.manager.delete(ServicePackage, { id: pkg.id });
    }

    // Delete business services
    await queryRunner.manager.delete(BusinessService, { businessOwnerId });

    // SIMPLER APPROACH: Break all circular/nullable foreign key references first
    // This allows us to delete in a simpler order without complex dependency tracking

    // Break reference: bookings.commissionTransactionId -> commission_transactions.id
    await queryRunner.manager.update(Booking, { businessOwnerId }, { commissionTransactionId: null });

    // Break circular reference: booking_requests.paymentId -> payments.id
    await queryRunner.manager.update(BookingRequest, { businessOwnerId }, { paymentId: null });

    // Break reference: wallet_transactions.paymentId -> payments.id
    // IMPORTANT: We need to break ALL wallet_transaction references to this business owner's payments,
    // not just the business owner's own wallet (customers' wallets might also reference these payments)
    await queryRunner.query(
      `UPDATE wallet_transactions SET payment_id = NULL
       WHERE payment_id IN (SELECT id FROM payments WHERE business_owner_id = $1)`,
      [businessOwnerId]
    );

    // Break reference: wallet_transactions.bookingId -> bookings.id
    // IMPORTANT: Break ALL wallet_transaction references to this business owner's bookings
    await queryRunner.query(
      `UPDATE wallet_transactions SET booking_id = NULL
       WHERE booking_id IN (SELECT id FROM bookings WHERE business_owner_id = $1)`,
      [businessOwnerId]
    );

    // Break reference: commission_transactions -> wallet_transactions
    await queryRunner.manager.update(
      CommissionTransaction,
      { businessOwnerId },
      {
        businessOwnerWalletTransactionId: null,
        customerWalletTransactionId: null
      }
    );

    // Now delete in simpler order since FK constraints are broken
    await queryRunner.manager.delete(CommissionTransaction, { businessOwnerId });
    await queryRunner.manager.delete(CommissionPayment, { businessOwnerId });
    if (walletId) {
      await queryRunner.manager.delete(WalletTransaction, { walletId });
    }
    await queryRunner.manager.delete(Payment, { businessOwnerId });

    // Break reference: bookings.bookingRequestId -> booking_requests.id
    await queryRunner.manager.update(Booking, { businessOwnerId }, { bookingRequestId: null });

    // Delete COD transactions BEFORE bookings (cod_transactions.bookingId is non-nullable FK)
    await queryRunner.manager.delete(CODTransaction, { businessOwnerId });

    // Delete bookings as business owner FIRST (before booking requests, since we broke the FK)
    const businessBookings = await this.bookingRepository.find({
      where: { businessOwnerId },
    });

    for (const booking of businessBookings) {
      await queryRunner.manager.delete(BookingService, { bookingId: booking.id });
      await queryRunner.manager.delete(Booking, { id: booking.id });
    }

    // Delete booking requests as business owner (after bookings)
    const businessBookingRequests = await this.bookingRequestRepository.find({
      where: { businessOwnerId },
    });

    for (const request of businessBookingRequests) {
      await queryRunner.manager.delete(BookingRequestService, { bookingRequestId: request.id });
      await queryRunner.manager.delete(BookingRequest, { id: request.id });
    }

    // Delete settlements
    const settlements = await this.monthlySettlementRepository.find({
      where: { businessOwnerId },
    });

    for (const settlement of settlements) {
      await queryRunner.manager.delete(SettlementTransaction, { settlementId: settlement.id });
      await queryRunner.manager.delete(MonthlySettlement, { id: settlement.id });
    }

    // Delete subscription transactions before business subscriptions
    const businessSubscriptions = await queryRunner.manager.find(BusinessSubscription, {
      where: { businessOwnerId },
    });
    for (const subscription of businessSubscriptions) {
      await queryRunner.manager.delete(SubscriptionTransaction, { businessSubscriptionId: subscription.id });
    }

    // Delete business subscriptions
    await queryRunner.manager.delete(BusinessSubscription, { businessOwnerId });

    // Delete business settings
    await queryRunner.manager.delete(BusinessSettings, { businessOwnerId });

    // Delete banking info
    await queryRunner.manager.delete(BankingInfo, { businessOwnerId });

    // Delete business media and S3 files
    const businessMedias = await this.businessMediaRepository.find({
      where: { businessOwnerId },
    });

    for (const media of businessMedias) {
      if (media.s3Key) {
        try {
          await this.s3Service.deleteFile(media.s3Key);
        } catch (error) {
          console.error('Failed to delete business media from S3:', error);
        }
      }
      await queryRunner.manager.delete(BusinessMedia, { id: media.id });
    }

    // Delete business operating hours
    await queryRunner.manager.delete(BusinessOperatingHours, { businessOwnerId });

    // Delete business addresses
    await queryRunner.manager.delete(BusinessAddress, { businessOwnerId });

    // Delete business approvals
    await queryRunner.manager.delete(BusinessApproval, { businessOwnerId });

    // Delete customer favorites where this business is favorited (will cascade)
    await queryRunner.manager.delete(CustomerFavorite, { businessOwnerId });

    // Delete business owner onboarding
    await queryRunner.manager.delete(BusinessOwnerOnboarding, { businessOwnerId });

    // Delete business owner record
    await queryRunner.manager.delete(BusinessOwner, { id: businessOwnerId });
  }

  private buildAgentDto(agent: Agent): AgentDto {
    return {
      id: agent.id,
      userId: agent.userId,
      username: agent.username,
      phone: agent.user?.phone,
      email: agent.user?.email,
      firstName: agent.firstName,
      lastName: agent.lastName,
      fullName: agent.fullName,
      gender: agent.gender,
      dateOfBirth: agent.dateOfBirth ? (agent.dateOfBirth instanceof Date ? agent.dateOfBirth.toISOString().split('T')[0] : agent.dateOfBirth) : undefined,
      employeeId: agent.employeeId,
      department: agent.department,
      position: agent.position,
      hireDate: agent.hireDate ? (agent.hireDate instanceof Date ? agent.hireDate.toISOString().split('T')[0] : agent.hireDate) : undefined,
      salary: agent.salary,
      isActive: agent.isActive,
      lastLogin: agent.lastLogin,
      permissions: agent.permissions,
      notes: agent.notes,
      createdByAdminId: agent.createdByAdminId,
      createdByAdminUsername: agent.createdByAdmin?.username,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
}