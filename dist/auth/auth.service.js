"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const entities_1 = require("../database/entities");
const enums_1 = require("../common/enums");
const otp_service_1 = require("../common/services/otp/otp.service");
const notification_service_1 = require("../notification/notification.service");
const s3_service_1 = require("../common/services/s3.service");
const api_response_dto_1 = require("../common/dto/api-response.dto");
let AuthService = class AuthService {
    constructor(jwtService, configService, otpService, notificationService, s3Service, dataSource, userRepository, userRoleRepository, customerRepository, customerOnboardingRepository, businessOwnerRepository, businessOwnerOnboardingRepository, refreshTokenRepository, adminRepository, agentRepository, walletRepository, walletTransactionRepository, customerRewardPointsRepository, customerFavoriteRepository, bookingRepository, bookingServiceRepository, bookingRequestRepository, bookingRequestServiceRepository, paymentRepository, commissionTransactionRepository, userAddressRepository, staffRepository, businessServiceRepository, servicePackageRepository, bankingInfoRepository, businessMediaRepository, businessOperatingHoursRepository, businessSettingsRepository, businessSubscriptionRepository, businessAddressRepository, businessApprovalRepository, monthlySettlementRepository, settlementTransactionRepository, commissionPaymentRepository, codTransactionRepository) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.otpService = otpService;
        this.notificationService = notificationService;
        this.s3Service = s3Service;
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.customerRepository = customerRepository;
        this.customerOnboardingRepository = customerOnboardingRepository;
        this.businessOwnerRepository = businessOwnerRepository;
        this.businessOwnerOnboardingRepository = businessOwnerOnboardingRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.adminRepository = adminRepository;
        this.agentRepository = agentRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.customerRewardPointsRepository = customerRewardPointsRepository;
        this.customerFavoriteRepository = customerFavoriteRepository;
        this.bookingRepository = bookingRepository;
        this.bookingServiceRepository = bookingServiceRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingRequestServiceRepository = bookingRequestServiceRepository;
        this.paymentRepository = paymentRepository;
        this.commissionTransactionRepository = commissionTransactionRepository;
        this.userAddressRepository = userAddressRepository;
        this.staffRepository = staffRepository;
        this.businessServiceRepository = businessServiceRepository;
        this.servicePackageRepository = servicePackageRepository;
        this.bankingInfoRepository = bankingInfoRepository;
        this.businessMediaRepository = businessMediaRepository;
        this.businessOperatingHoursRepository = businessOperatingHoursRepository;
        this.businessSettingsRepository = businessSettingsRepository;
        this.businessSubscriptionRepository = businessSubscriptionRepository;
        this.businessAddressRepository = businessAddressRepository;
        this.businessApprovalRepository = businessApprovalRepository;
        this.monthlySettlementRepository = monthlySettlementRepository;
        this.settlementTransactionRepository = settlementTransactionRepository;
        this.commissionPaymentRepository = commissionPaymentRepository;
        this.codTransactionRepository = codTransactionRepository;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('app.google.clientId'));
    }
    async sendOtp(phone, role) {
        if (role === enums_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Admin role cannot use phone OTP authentication. Please use admin login.');
        }
        if (role === enums_1.UserRole.AGENT) {
            throw new common_1.BadRequestException('Agent role cannot use phone OTP authentication. Agents are created and managed by admins.');
        }
        const normalizedPhone = this.normalizePhoneNumber(phone);
        const success = await this.otpService.generateAndSendOtp(normalizedPhone, role);
        if (!success) {
            throw new common_1.BadRequestException('Failed to send OTP');
        }
        return new api_response_dto_1.SendOtpResponseDto();
    }
    async verifyOtpAndAuth(phone, otp, role) {
        if (role === enums_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Admin role cannot use phone OTP authentication. Please use admin login.');
        }
        if (role === enums_1.UserRole.AGENT) {
            throw new common_1.BadRequestException('Agent role cannot use phone OTP authentication. Agents are created and managed by admins.');
        }
        const normalizedPhone = this.normalizePhoneNumber(phone);
        const isValidOtp = await this.otpService.verifyOtp(normalizedPhone, otp, role);
        if (!isValidOtp) {
            await this.otpService.incrementAttempts(normalizedPhone, otp);
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        let user = await this.userRepository.findOne({
            where: { phone: normalizedPhone },
            relations: ['roles'],
        });
        let isNewUser = false;
        if (!user) {
            user = await this.createNewUser(normalizedPhone, role);
            isNewUser = true;
        }
        else {
            const existingRoles = user.roles.map(r => r.role);
            if (!existingRoles.includes(role)) {
                await this.addRoleToUser(user.id, role);
                user = await this.userRepository.findOne({
                    where: { phone: normalizedPhone },
                    relations: ['roles'],
                });
            }
        }
        if (!user.isPhoneVerified) {
            user.isPhoneVerified = true;
            await this.userRepository.save(user);
        }
        const authData = await this.buildAuthResponse(user, isNewUser, role);
        return new api_response_dto_1.VerifyOtpResponseDto(200, true, 'OTP verified successfully', authData);
    }
    async googleSignIn(idToken, role) {
        if (role === enums_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Admin role cannot use Google sign-in. Please use admin login.');
        }
        if (role === enums_1.UserRole.AGENT) {
            throw new common_1.BadRequestException('Agent role cannot use Google sign-in. Agents are created and managed by admins.');
        }
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: this.configService.get('app.google.clientId'),
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new common_1.BadRequestException('Invalid Google ID token - missing email');
            }
            const { email, name, picture } = payload;
            let user = await this.userRepository.findOne({
                where: { email },
                relations: ['roles'],
            });
            let isNewUser = false;
            if (!user) {
                user = await this.createNewGoogleUser(email, name, picture, role);
                isNewUser = true;
            }
            else {
                const existingRoles = user.roles.map(r => r.role);
                if (!existingRoles.includes(role)) {
                    await this.addRoleToUser(user.id, role);
                    user = await this.userRepository.findOne({
                        where: { email },
                        relations: ['roles'],
                    });
                }
            }
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                await this.userRepository.save(user);
            }
            const authData = await this.buildAuthResponse(user, isNewUser, role);
            return new api_response_dto_1.VerifyOtpResponseDto(200, true, 'Google sign-in successful', authData);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid or expired Google ID token');
        }
    }
    async createNewGoogleUser(email, name, picture, role) {
        const user = this.userRepository.create({
            phone: '',
            email,
            profilePic: picture,
            isEmailVerified: true,
        });
        const savedUser = await this.userRepository.save(user);
        await this.addRoleToUser(savedUser.id, role);
        if (name && role === enums_1.UserRole.CUSTOMER) {
            const customer = await this.customerRepository.findOne({
                where: { userId: savedUser.id },
            });
            if (customer && !customer.firstName) {
                customer.firstName = name;
                await this.customerRepository.save(customer);
            }
        }
        else if (name && role === enums_1.UserRole.BUSINESS_OWNER) {
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
    async refreshToken(refreshToken) {
        const tokenRecords = await this.refreshTokenRepository.find({
            where: {
                isRevoked: false,
                expiresAt: (0, typeorm_2.MoreThan)(new Date())
            },
            relations: ['user'],
        });
        let tokenRecord = null;
        for (const record of tokenRecords) {
            if (await bcrypt.compare(refreshToken, record.tokenHash)) {
                tokenRecord = record;
                break;
            }
        }
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const user = tokenRecord.user;
        const roles = await this.userRoleRepository.find({
            where: { userId: user.id, isActive: true },
        });
        const tokens = await this.generateTokens(user, roles.map(r => r.role));
        tokenRecord.isRevoked = true;
        await this.refreshTokenRepository.save(tokenRecord);
        return tokens;
    }
    async logout(userId) {
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
        await this.userRepository.update(userId, { fcmToken: null });
        await this.notificationService.deactivateAllUserTokens(userId);
        return new api_response_dto_1.ApiResponseDto(200, true, 'Logged out successfully');
    }
    async createNewUser(phone, role) {
        const user = this.userRepository.create({
            phone,
            isPhoneVerified: true,
        });
        const savedUser = await this.userRepository.save(user);
        await this.addRoleToUser(savedUser.id, role);
        return savedUser;
    }
    async addRoleToUser(userId, role) {
        if (role === enums_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Admin role cannot be assigned through this method. Admins are managed separately.');
        }
        if (role === enums_1.UserRole.AGENT) {
            throw new common_1.BadRequestException('Agent role cannot be assigned through this method. Agents are created and managed by admins.');
        }
        const existingRoles = await this.userRoleRepository.find({
            where: { userId, isActive: true },
        });
        const existingRole = existingRoles.find(r => r.role === role);
        if (existingRole) {
            return;
        }
        const hasAdminRole = existingRoles.some(r => r.role === enums_1.UserRole.ADMIN);
        const hasAgentRole = existingRoles.some(r => r.role === enums_1.UserRole.AGENT);
        if (hasAdminRole) {
            throw new common_1.BadRequestException('Admin users cannot have other roles.');
        }
        if (hasAgentRole) {
            throw new common_1.BadRequestException('Agent users cannot have other roles.');
        }
        const userRole = this.userRoleRepository.create({
            userId,
            role,
        });
        await this.userRoleRepository.save(userRole);
        if (role === enums_1.UserRole.CUSTOMER) {
            await this.createCustomerProfile(userId);
        }
        else if (role === enums_1.UserRole.BUSINESS_OWNER) {
            await this.createBusinessOwnerProfile(userId);
        }
    }
    async createCustomerProfile(userId) {
        const existingCustomer = await this.customerRepository.findOne({
            where: { userId },
        });
        if (existingCustomer) {
            return;
        }
        const customer = this.customerRepository.create({
            userId,
        });
        const savedCustomer = await this.customerRepository.save(customer);
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
    async createBusinessOwnerProfile(userId) {
        const existingBusinessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (existingBusinessOwner) {
            return;
        }
        const businessOwner = this.businessOwnerRepository.create({
            userId,
        });
        const savedBusinessOwner = await this.businessOwnerRepository.save(businessOwner);
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
    async buildAuthResponse(user, isNewUser, requestedRole) {
        const roles = await this.userRoleRepository.find({
            where: { userId: user.id, isActive: true },
        });
        const roleNames = roles.map(r => r.role);
        const tokens = await this.generateTokens(user, roleNames);
        const onboardingStatus = {};
        let name;
        if (requestedRole === enums_1.UserRole.CUSTOMER) {
            let customer = await this.customerRepository.findOne({
                where: { userId: user.id },
                relations: ['onboarding'],
            });
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
        }
        else if (requestedRole === enums_1.UserRole.BUSINESS_OWNER) {
            let businessOwner = await this.businessOwnerRepository.findOne({
                where: { userId: user.id },
                relations: ['onboarding'],
            });
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
        const userDto = {
            id: user.id,
            phone: user.phone,
            email: user.email,
            profilePic: user.profilePic,
            name,
            roles: [requestedRole],
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
    async generateTokens(user, roles) {
        const payload = {
            sub: user.id,
            phone: user.phone,
            roles,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('app.jwt.accessTokenExpiry'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('app.jwt.refreshTokenExpiry'),
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const tokenRecord = this.refreshTokenRepository.create({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt,
        });
        await this.refreshTokenRepository.save(tokenRecord);
        return { accessToken, refreshToken };
    }
    normalizePhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            return cleaned.substring(2);
        }
        if (cleaned.length === 10) {
            return cleaned;
        }
        throw new common_1.BadRequestException('Invalid phone number format');
    }
    async updateFcmToken(userId, fcmTokenDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        await this.userRepository.update(userId, {
            fcmToken: fcmTokenDto.fcmToken,
            deviceType: fcmTokenDto.deviceType,
            deviceId: fcmTokenDto.deviceId,
        });
        return new api_response_dto_1.ApiResponseDto(200, true, 'FCM token updated successfully');
    }
    async adminLogin(adminLoginDto) {
        const { username, password } = adminLoginDto;
        const admin = await this.adminRepository.findOne({
            where: { username, isActive: true },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const isPasswordValid = await admin.validatePassword(password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        admin.lastLogin = new Date();
        await this.adminRepository.save(admin);
        const payload = {
            sub: admin.id,
            username: admin.username,
            roles: [enums_1.UserRole.ADMIN],
            type: 'admin',
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('app.jwt.accessTokenExpiry'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('app.jwt.refreshTokenExpiry'),
        });
        const adminDto = {
            id: admin.id,
            username: admin.username,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            fullName: admin.fullName,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin,
            role: enums_1.UserRole.ADMIN,
        };
        const tokens = { accessToken, refreshToken };
        return {
            admin: adminDto,
            tokens,
            isNewLogin: !admin.lastLogin || admin.lastLogin.getTime() === new Date().getTime(),
        };
    }
    async agentLogin(agentLoginDto) {
        const { username, password } = agentLoginDto;
        const agent = await this.agentRepository.findOne({
            where: { username, isActive: true },
            relations: ['user', 'createdByAdmin'],
        });
        if (!agent) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const isPasswordValid = await agent.validatePassword(password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        agent.lastLogin = new Date();
        await this.agentRepository.save(agent);
        const payload = {
            sub: agent.id,
            username: agent.username,
            roles: [enums_1.UserRole.AGENT],
            type: 'agent',
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('app.jwt.accessTokenExpiry'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('app.jwt.refreshTokenExpiry'),
        });
        const agentDto = this.buildAgentDto(agent);
        const tokens = { accessToken, refreshToken };
        return {
            agent: agentDto,
            tokens,
            isNewLogin: !agent.lastLogin || agent.lastLogin.getTime() === new Date().getTime(),
        };
    }
    async createAgent(createAgentDto, adminId) {
        const normalizedPhone = this.normalizePhoneNumber(createAgentDto.phone);
        const existingUser = await this.userRepository.findOne({
            where: { phone: normalizedPhone },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this phone number already exists');
        }
        const existingAgent = await this.agentRepository.findOne({
            where: { username: createAgentDto.username },
        });
        if (existingAgent) {
            throw new common_1.ConflictException('Agent with this username already exists');
        }
        if (createAgentDto.employeeId) {
            const existingAgentByEmployeeId = await this.agentRepository.findOne({
                where: { employeeId: createAgentDto.employeeId },
            });
            if (existingAgentByEmployeeId) {
                throw new common_1.ConflictException('Agent with this employee ID already exists');
            }
        }
        const user = this.userRepository.create({
            phone: normalizedPhone,
            email: createAgentDto.email,
            isPhoneVerified: true,
            isEmailVerified: !!createAgentDto.email,
        });
        const savedUser = await this.userRepository.save(user);
        const userRole = this.userRoleRepository.create({
            userId: savedUser.id,
            role: enums_1.UserRole.AGENT,
        });
        await this.userRoleRepository.save(userRole);
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
    async updateAgent(agentId, updateAgentDto, adminId) {
        const agent = await this.agentRepository.findOne({
            where: { id: agentId },
            relations: ['user', 'createdByAdmin'],
        });
        if (!agent) {
            throw new common_1.BadRequestException('Agent not found');
        }
        if (updateAgentDto.employeeId && updateAgentDto.employeeId !== agent.employeeId) {
            const existingAgent = await this.agentRepository.findOne({
                where: { employeeId: updateAgentDto.employeeId },
            });
            if (existingAgent && existingAgent.id !== agentId) {
                throw new common_1.ConflictException('Agent with this employee ID already exists');
            }
        }
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
    async getAgent(agentId) {
        const agent = await this.agentRepository.findOne({
            where: { id: agentId },
            relations: ['user', 'createdByAdmin'],
        });
        if (!agent) {
            throw new common_1.BadRequestException('Agent not found');
        }
        return this.buildAgentDto(agent);
    }
    async getAgents(page = 1, limit = 10, isActive) {
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
    async deleteAgent(agentId) {
        const agent = await this.agentRepository.findOne({
            where: { id: agentId },
            relations: ['user'],
        });
        if (!agent) {
            throw new common_1.BadRequestException('Agent not found');
        }
        agent.isActive = false;
        await this.agentRepository.save(agent);
        await this.userRoleRepository.update({ userId: agent.userId, role: enums_1.UserRole.AGENT }, { isActive: false });
        return { message: 'Agent deactivated successfully' };
    }
    async deleteAccount(userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['roles'],
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const roles = user.roles.map(r => r.role);
            const isCustomer = roles.includes(enums_1.UserRole.CUSTOMER);
            const isBusinessOwner = roles.includes(enums_1.UserRole.BUSINESS_OWNER);
            if (user.profilePicS3Key) {
                try {
                    await this.s3Service.deleteFile(user.profilePicS3Key);
                }
                catch (error) {
                    console.error('Failed to delete user profile picture from S3:', error);
                }
            }
            const wallet = await this.walletRepository.findOne({ where: { userId } });
            if (isCustomer) {
                await this.deleteCustomerData(userId, queryRunner, wallet?.id);
            }
            if (isBusinessOwner) {
                await this.deleteBusinessOwnerData(userId, queryRunner, wallet?.id);
            }
            await queryRunner.manager.delete(entities_1.UserAddress, { userId });
            await queryRunner.manager.delete(entities_1.RefreshToken, { userId });
            await queryRunner.manager.delete(entities_1.UserRole, { userId });
            await queryRunner.query(`DELETE FROM wallet_transactions WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id = $1)`, [userId]);
            await queryRunner.manager.delete(entities_1.Wallet, { userId });
            await queryRunner.manager.delete(entities_1.User, { id: userId });
            await queryRunner.commitTransaction();
            return new api_response_dto_1.ApiResponseDto(200, true, 'Account deleted successfully');
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deactivateAccount(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const roles = user.roles.map(r => r.role);
        const isCustomer = roles.includes(enums_1.UserRole.CUSTOMER);
        const isBusinessOwner = roles.includes(enums_1.UserRole.BUSINESS_OWNER);
        if (isCustomer) {
            const customer = await this.customerRepository.findOne({
                where: { userId },
            });
            if (customer) {
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
        if (isBusinessOwner) {
            const businessOwner = await this.businessOwnerRepository.findOne({
                where: { userId },
            });
            if (businessOwner) {
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
        await this.refreshTokenRepository.delete({ userId });
        return new api_response_dto_1.ApiResponseDto(200, true, 'Account deleted successfully');
    }
    async deleteCustomerData(userId, queryRunner, walletId) {
        const customer = await this.customerRepository.findOne({
            where: { userId },
        });
        if (!customer) {
            return;
        }
        const customerId = customer.id;
        await queryRunner.manager.delete(entities_1.CustomerRewardPoints, { customerId });
        await queryRunner.manager.delete(entities_1.CustomerFavorite, { customerId });
        await queryRunner.manager.update(entities_1.Booking, { customerId }, { commissionTransactionId: null });
        await queryRunner.manager.update(entities_1.BookingRequest, { customerId }, { paymentId: null });
        await queryRunner.query(`UPDATE wallet_transactions SET payment_id = NULL
       WHERE payment_id IN (SELECT id FROM payments WHERE customer_id = $1)`, [customerId]);
        await queryRunner.query(`UPDATE wallet_transactions SET booking_id = NULL
       WHERE booking_id IN (SELECT id FROM bookings WHERE customer_id = $1)`, [customerId]);
        await queryRunner.manager.update(entities_1.CommissionTransaction, { customerId }, {
            businessOwnerWalletTransactionId: null,
            customerWalletTransactionId: null
        });
        await queryRunner.manager.delete(entities_1.CommissionTransaction, { customerId });
        if (walletId) {
            await queryRunner.manager.delete(entities_1.WalletTransaction, { walletId });
        }
        await queryRunner.manager.delete(entities_1.Payment, { customerId });
        await queryRunner.manager.update(entities_1.Booking, { customerId }, { bookingRequestId: null });
        await queryRunner.query(`DELETE FROM cod_transactions WHERE booking_id IN (SELECT id FROM bookings WHERE customer_id = $1)`, [customerId]);
        const customerBookings = await this.bookingRepository.find({
            where: { customerId },
        });
        for (const booking of customerBookings) {
            await queryRunner.manager.delete(entities_1.BookingService, { bookingId: booking.id });
            await queryRunner.manager.delete(entities_1.Booking, { id: booking.id });
        }
        const customerBookingRequests = await this.bookingRequestRepository.find({
            where: { customerId },
        });
        for (const request of customerBookingRequests) {
            await queryRunner.manager.delete(entities_1.BookingRequestService, { bookingRequestId: request.id });
            await queryRunner.manager.delete(entities_1.BookingRequest, { id: request.id });
        }
        await queryRunner.manager.delete(entities_1.CustomerOnboarding, { customerId });
        await queryRunner.manager.delete(entities_1.Customer, { id: customerId });
    }
    async deleteBusinessOwnerData(userId, queryRunner, walletId) {
        const businessOwner = await this.businessOwnerRepository.findOne({
            where: { userId },
        });
        if (!businessOwner) {
            return;
        }
        const businessOwnerId = businessOwner.id;
        const staffMembers = await this.staffRepository.find({
            where: { businessOwnerId },
        });
        for (const staff of staffMembers) {
            if (staff.profilePicS3Key) {
                try {
                    await this.s3Service.deleteFile(staff.profilePicS3Key);
                }
                catch (error) {
                    console.error('Failed to delete staff profile picture from S3:', error);
                }
            }
            await queryRunner.manager.delete(entities_1.StaffService, { staffId: staff.id });
            await queryRunner.manager.delete(entities_1.StaffScheduleOverride, { staffId: staff.id });
            await queryRunner.manager.delete(entities_1.StaffBreak, { staffId: staff.id });
            await queryRunner.manager.delete(entities_1.StaffWorkingHours, { staffId: staff.id });
            await queryRunner.manager.delete(entities_1.Staff, { id: staff.id });
        }
        const servicePackages = await this.servicePackageRepository.find({
            where: { businessOwnerId },
        });
        for (const pkg of servicePackages) {
            await queryRunner.manager.delete(entities_1.ServicePackageItem, { packageId: pkg.id });
            await queryRunner.manager.delete(entities_1.ServicePackage, { id: pkg.id });
        }
        await queryRunner.manager.delete(entities_1.BusinessService, { businessOwnerId });
        await queryRunner.manager.update(entities_1.Booking, { businessOwnerId }, { commissionTransactionId: null });
        await queryRunner.manager.update(entities_1.BookingRequest, { businessOwnerId }, { paymentId: null });
        await queryRunner.query(`UPDATE wallet_transactions SET payment_id = NULL
       WHERE payment_id IN (SELECT id FROM payments WHERE business_owner_id = $1)`, [businessOwnerId]);
        await queryRunner.query(`UPDATE wallet_transactions SET booking_id = NULL
       WHERE booking_id IN (SELECT id FROM bookings WHERE business_owner_id = $1)`, [businessOwnerId]);
        await queryRunner.manager.update(entities_1.CommissionTransaction, { businessOwnerId }, {
            businessOwnerWalletTransactionId: null,
            customerWalletTransactionId: null
        });
        await queryRunner.manager.delete(entities_1.CommissionTransaction, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.CommissionPayment, { businessOwnerId });
        if (walletId) {
            await queryRunner.manager.delete(entities_1.WalletTransaction, { walletId });
        }
        await queryRunner.manager.delete(entities_1.Payment, { businessOwnerId });
        await queryRunner.manager.update(entities_1.Booking, { businessOwnerId }, { bookingRequestId: null });
        await queryRunner.manager.delete(entities_1.CODTransaction, { businessOwnerId });
        const businessBookings = await this.bookingRepository.find({
            where: { businessOwnerId },
        });
        for (const booking of businessBookings) {
            await queryRunner.manager.delete(entities_1.BookingService, { bookingId: booking.id });
            await queryRunner.manager.delete(entities_1.Booking, { id: booking.id });
        }
        const businessBookingRequests = await this.bookingRequestRepository.find({
            where: { businessOwnerId },
        });
        for (const request of businessBookingRequests) {
            await queryRunner.manager.delete(entities_1.BookingRequestService, { bookingRequestId: request.id });
            await queryRunner.manager.delete(entities_1.BookingRequest, { id: request.id });
        }
        const settlements = await this.monthlySettlementRepository.find({
            where: { businessOwnerId },
        });
        for (const settlement of settlements) {
            await queryRunner.manager.delete(entities_1.SettlementTransaction, { settlementId: settlement.id });
            await queryRunner.manager.delete(entities_1.MonthlySettlement, { id: settlement.id });
        }
        const businessSubscriptions = await queryRunner.manager.find(entities_1.BusinessSubscription, {
            where: { businessOwnerId },
        });
        for (const subscription of businessSubscriptions) {
            await queryRunner.manager.delete(entities_1.SubscriptionTransaction, { businessSubscriptionId: subscription.id });
        }
        await queryRunner.manager.delete(entities_1.BusinessSubscription, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.BusinessSettings, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.BankingInfo, { businessOwnerId });
        const businessMedias = await this.businessMediaRepository.find({
            where: { businessOwnerId },
        });
        for (const media of businessMedias) {
            if (media.s3Key) {
                try {
                    await this.s3Service.deleteFile(media.s3Key);
                }
                catch (error) {
                    console.error('Failed to delete business media from S3:', error);
                }
            }
            await queryRunner.manager.delete(entities_1.BusinessMedia, { id: media.id });
        }
        await queryRunner.manager.delete(entities_1.BusinessOperatingHours, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.BusinessAddress, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.BusinessApproval, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.CustomerFavorite, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.BusinessOwnerOnboarding, { businessOwnerId });
        await queryRunner.manager.delete(entities_1.BusinessOwner, { id: businessOwnerId });
    }
    buildAgentDto(agent) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.UserRole)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(9, (0, typeorm_1.InjectRepository)(entities_1.CustomerOnboarding)),
    __param(10, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwner)),
    __param(11, (0, typeorm_1.InjectRepository)(entities_1.BusinessOwnerOnboarding)),
    __param(12, (0, typeorm_1.InjectRepository)(entities_1.RefreshToken)),
    __param(13, (0, typeorm_1.InjectRepository)(entities_1.Admin)),
    __param(14, (0, typeorm_1.InjectRepository)(entities_1.Agent)),
    __param(15, (0, typeorm_1.InjectRepository)(entities_1.Wallet)),
    __param(16, (0, typeorm_1.InjectRepository)(entities_1.WalletTransaction)),
    __param(17, (0, typeorm_1.InjectRepository)(entities_1.CustomerRewardPoints)),
    __param(18, (0, typeorm_1.InjectRepository)(entities_1.CustomerFavorite)),
    __param(19, (0, typeorm_1.InjectRepository)(entities_1.Booking)),
    __param(20, (0, typeorm_1.InjectRepository)(entities_1.BookingService)),
    __param(21, (0, typeorm_1.InjectRepository)(entities_1.BookingRequest)),
    __param(22, (0, typeorm_1.InjectRepository)(entities_1.BookingRequestService)),
    __param(23, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(24, (0, typeorm_1.InjectRepository)(entities_1.CommissionTransaction)),
    __param(25, (0, typeorm_1.InjectRepository)(entities_1.UserAddress)),
    __param(26, (0, typeorm_1.InjectRepository)(entities_1.Staff)),
    __param(27, (0, typeorm_1.InjectRepository)(entities_1.BusinessService)),
    __param(28, (0, typeorm_1.InjectRepository)(entities_1.ServicePackage)),
    __param(29, (0, typeorm_1.InjectRepository)(entities_1.BankingInfo)),
    __param(30, (0, typeorm_1.InjectRepository)(entities_1.BusinessMedia)),
    __param(31, (0, typeorm_1.InjectRepository)(entities_1.BusinessOperatingHours)),
    __param(32, (0, typeorm_1.InjectRepository)(entities_1.BusinessSettings)),
    __param(33, (0, typeorm_1.InjectRepository)(entities_1.BusinessSubscription)),
    __param(34, (0, typeorm_1.InjectRepository)(entities_1.BusinessAddress)),
    __param(35, (0, typeorm_1.InjectRepository)(entities_1.BusinessApproval)),
    __param(36, (0, typeorm_1.InjectRepository)(entities_1.MonthlySettlement)),
    __param(37, (0, typeorm_1.InjectRepository)(entities_1.SettlementTransaction)),
    __param(38, (0, typeorm_1.InjectRepository)(entities_1.CommissionPayment)),
    __param(39, (0, typeorm_1.InjectRepository)(entities_1.CODTransaction)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        otp_service_1.OtpService,
        notification_service_1.NotificationService,
        s3_service_1.S3Service,
        typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map