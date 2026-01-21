import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums';

export class GoogleSignInDto {
  @ApiProperty({
    description: 'Google ID token obtained from Flutter google_sign_in package',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3...',
  })
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @ApiProperty({
    description: 'User role to assign after Google sign-in',
    example: 'customer',
    enum: UserRole,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: 'Role must be either customer or business_owner',
  })
  role: UserRole;
}
