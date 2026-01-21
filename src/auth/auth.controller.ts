import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { AdminOnly } from '../common/decorators/admin-only.decorator';
import {
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokensDto,
  FcmTokenDto,
  AdminLoginDto,
  AdminAuthResponseDto,
  AgentLoginDto,
  AgentAuthResponseDto,
  CreateAgentDto,
  UpdateAgentDto,
  AgentDto,
  AgentListResponseDto,
  AgentCreateResponseDto,
  GoogleSignInDto,
} from './dto';
import { SendOtpResponseDto, VerifyOtpResponseDto, ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP to phone number for specific role',
    description: 'Sends a 6-digit OTP to the provided phone number for role-based authentication. The role is tied to the OTP for security.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid phone number, unsupported role, or failed to send OTP',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - Rate limit exceeded',
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phone, sendOtpDto.role);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and authenticate',
    description: 'Verifies the OTP and returns user data with JWT tokens. Validates that the role matches the one requested during send-otp. Creates user profile based on specified role. Works for both login and signup.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully, user authenticated',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired OTP, or role mismatch',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or unsupported role',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto<AuthResponseDto>> {
    return this.authService.verifyOtpAndAuth(
      verifyOtpDto.phone,
      verifyOtpDto.otp,
      verifyOtpDto.role,
    );
  }

  @Public()
  @Post('google/signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Google Sign-In with ID token',
    description: 'Authenticates user using Google ID token from Flutter google_sign_in package. Works for both new and existing users. Similar to OTP verification flow.',
  })
  @ApiResponse({
    status: 200,
    description: 'Google authentication successful',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired Google ID token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or unsupported role',
  })
  async googleSignIn(@Body() googleSignInDto: GoogleSignInDto): Promise<VerifyOtpResponseDto<AuthResponseDto>> {
    return this.authService.googleSignIn(googleSignInDto.idToken, googleSignInDto.role);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates new access and refresh tokens using a valid refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: TokensDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description: 'Returns the current authenticated user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', format: 'uuid' },
        phone: { type: 'string' },
        email: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getProfile(@Req() req) {
    return req.user;
  }

  @Post('fcm-token')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update FCM token for push notifications',
    description: 'Updates the Firebase Cloud Messaging token for the authenticated user to enable push notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'FCM token updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid FCM token format',
  })
  async updateFcmToken(@Body() fcmTokenDto: FcmTokenDto, @Req() req): Promise<ApiResponseDto> {
    return this.authService.updateFcmToken(req.user.userId, fcmTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the authenticated user by invalidating their refresh token. Works for all user roles (customer, business_owner, agent, admin).',
  })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async logout(@Req() req): Promise<ApiResponseDto> {
    return this.authService.logout(req.user.userId);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login with username and password',
    description: 'Authenticates admin users using username and password. Admin role is separate and cannot have other roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin authenticated successfully',
    type: AdminAuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid username or password, or admin is inactive',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async adminLogin(@Body() adminLoginDto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    return this.authService.adminLogin(adminLoginDto);
  }

  @Public()
  @Post('agent/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Agent login with username and password',
    description: 'Authenticates agent users using username and password. Agent role is separate from regular users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent authenticated successfully',
    type: AgentAuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid username or password, or agent is inactive',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async agentLogin(@Body() agentLoginDto: AgentLoginDto): Promise<AgentAuthResponseDto> {
    return this.authService.agentLogin(agentLoginDto);
  }

  @AdminOnly()
  @Post('admin/agents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new agent (Admin only)',
    description: 'Creates a new agent with user account and role. Only admins can create agents.',
  })
  @ApiResponse({
    status: 201,
    description: 'Agent created successfully',
    type: AgentCreateResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User with phone or employee ID already exists',
  })
  async createAgent(@Body() createAgentDto: CreateAgentDto, @Req() req): Promise<AgentCreateResponseDto> {
    return this.authService.createAgent(createAgentDto, req.admin.id);
  }

  @AdminOnly()
  @Get('admin/agents')
  @ApiOperation({
    summary: 'Get all agents (Admin only)',
    description: 'Retrieves a paginated list of all agents. Only admins can view agents.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agents retrieved successfully',
    type: AgentListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getAgents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isActive') isActive?: string,
  ): Promise<AgentListResponseDto> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.authService.getAgents(pageNum, limitNum, isActiveBool);
  }

  @AdminOnly()
  @Get('admin/agents/:id')
  @ApiOperation({
    summary: 'Get agent by ID (Admin only)',
    description: 'Retrieves detailed information about a specific agent. Only admins can view agent details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent retrieved successfully',
    type: AgentDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Agent not found',
  })
  async getAgent(@Param('id', ParseUUIDPipe) id: string): Promise<AgentDto> {
    return this.authService.getAgent(id);
  }

  @AdminOnly()
  @Put('admin/agents/:id')
  @ApiOperation({
    summary: 'Update agent (Admin only)',
    description: 'Updates agent information and permissions. Only admins can update agents.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent updated successfully',
    type: AgentDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Agent not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Employee ID already exists',
  })
  async updateAgent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Req() req,
  ): Promise<AgentDto> {
    return this.authService.updateAgent(id, updateAgentDto, req.admin.id);
  }

  @AdminOnly()
  @Delete('admin/agents/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate agent (Admin only)',
    description: 'Deactivates an agent (soft delete). Only admins can deactivate agents.',
  })
  @ApiResponse({
    status: 200,
    description: 'Agent deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Agent deactivated successfully' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Agent not found',
  })
  async deleteAgent(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.authService.deleteAgent(id);
  }

  @Delete('account')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user account permanently',
    description: 'Permanently deletes the authenticated user account and all associated data including bookings, wallet, favorites, and business information. This action cannot be undone. Works for both customers and business owners.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User not found',
  })
  async deleteAccount(@Req() req): Promise<ApiResponseDto> {
    return this.authService.deleteAccount(req.user.userId);
  }

  @Post('deactivate')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate user account',
    description: 'Deactivates the authenticated user account by resetting onboarding status. The account becomes inaccessible but all data (bookings, payments, wallet) is preserved. Works for both customers and business owners. User will be logged out immediately.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User not found',
  })
  async deactivateAccount(@Req() req): Promise<ApiResponseDto> {
    return this.authService.deactivateAccount(req.user.userId);
  }
}