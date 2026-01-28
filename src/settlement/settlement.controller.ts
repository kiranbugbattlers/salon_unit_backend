import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { SettlementService } from './settlement.service';

@ApiTags('settlements')
@Controller('settlements')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Get()
  @ApiOperation({
    summary: 'Test endpoint',
    description: 'Simple test to verify settlement controller is working',
  })
  async test(): Promise<any> {
    return {
      code: 200,
      success: true,
      message: 'Settlement controller is working',
      data: null,
    };
  }

  @Get('business-owner/:businessOwnerId')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.BUSINESS_OWNER)
  @ApiOperation({
    summary: 'Get settlement history for a business owner',
    description: 'Retrieves all settlement records for a specific business owner',
  })
  @ApiParam({
    name: 'businessOwnerId',
    description: 'ID of the business owner',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Settlement history retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Business owner not found',
  })
  async getBusinessOwnerSettlementHistory(
    @Param('businessOwnerId') businessOwnerId: string,
    @Req() req: any,
  ): Promise<any> {
    return this.settlementService.getBusinessOwnerSettlementHistory(businessOwnerId, req.user);
  }

  @Get('debug/user-info')
  @ApiOperation({
    summary: 'Debug endpoint to check user info',
    description: 'Returns current user information for debugging',
  })
  async debugUserInfo(@Req() req: any): Promise<any> {
    return {
      code: 200,
      success: true,
      message: 'User info retrieved',
      data: {
        user: req.user,
        userKeys: Object.keys(req.user || {}),
        userRole: req.user?.role || req.user?.userRole || req.user?.user?.role,
        userId: req.user?.sub || req.user?.id || req.user?.userId || req.user?.user?.id,
        headers: req.headers,
      },
    };
  }

  @Get('my-settlements')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current business owner settlement history',
    description: 'Retrieves settlement history for the currently authenticated business owner',
  })
  @ApiResponse({
    status: 200,
    description: 'Settlement history retrieved successfully',
  })
  async getMySettlementHistory(@Req() req: any): Promise<any> {
    return this.settlementService.getBusinessOwnerSettlementHistory(req.user.sub, req.user);
  }
}
