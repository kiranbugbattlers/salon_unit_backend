import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto, AuthResponseDto, TokensDto, FcmTokenDto, AdminLoginDto, AdminAuthResponseDto, AgentLoginDto, AgentAuthResponseDto, CreateAgentDto, UpdateAgentDto, AgentDto, AgentListResponseDto, AgentCreateResponseDto, GoogleSignInDto } from './dto';
import { SendOtpResponseDto, VerifyOtpResponseDto, ApiResponseDto } from '../common/dto/api-response.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<SendOtpResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto<AuthResponseDto>>;
    googleSignIn(googleSignInDto: GoogleSignInDto): Promise<VerifyOtpResponseDto<AuthResponseDto>>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokensDto>;
    getProfile(req: any): Promise<any>;
    updateFcmToken(fcmTokenDto: FcmTokenDto, req: any): Promise<ApiResponseDto>;
    logout(req: any): Promise<ApiResponseDto>;
    adminLogin(adminLoginDto: AdminLoginDto): Promise<AdminAuthResponseDto>;
    agentLogin(agentLoginDto: AgentLoginDto): Promise<AgentAuthResponseDto>;
    createAgent(createAgentDto: CreateAgentDto, req: any): Promise<AgentCreateResponseDto>;
    getAgents(page?: string, limit?: string, isActive?: string): Promise<AgentListResponseDto>;
    getAgent(id: string): Promise<AgentDto>;
    updateAgent(id: string, updateAgentDto: UpdateAgentDto, req: any): Promise<AgentDto>;
    deleteAgent(id: string): Promise<{
        message: string;
    }>;
    deleteAccount(req: any): Promise<ApiResponseDto>;
    deactivateAccount(req: any): Promise<ApiResponseDto>;
}
