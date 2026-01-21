import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data?: T;

  constructor(code: number, success: boolean, message: string, data?: T) {
    this.code = code;
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export class SendOtpResponseDto extends ApiResponseDto<null> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'OTP sent successfully' })
  message: string;

  constructor(code: number = 200, success: boolean = true, message: string = 'OTP sent successfully') {
    super(code, success, message);
  }
}

export class VerifyOtpResponseDto<T> extends ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'OTP verified successfully' })
  message: string;

  constructor(code: number, success: boolean, message: string, data: T) {
    super(code, success, message, data);
  }
}