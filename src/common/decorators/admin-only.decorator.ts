import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';

export function AdminOnly() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt'), AdminGuard),
    ApiBearerAuth('JWT'),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Admin access required',
    }),
  );
}