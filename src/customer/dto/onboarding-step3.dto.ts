import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsArray, IsUUID, IsOptional } from 'class-validator';
import { HairType } from '../../common/enums';

export class OnboardingStep3Dto {
  @ApiProperty({
    description: 'Hair type',
    enum: HairType,
    example: HairType.STRAIGHT,
  })
  @IsNotEmpty()
  @IsEnum(HairType)
  hairType: HairType;

  @ApiProperty({
    description: 'Preferred service category IDs',
    example: ['uuid1', 'uuid2', 'uuid3'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID(4, { each: true })
  preferredCategoryIds: string[];
}