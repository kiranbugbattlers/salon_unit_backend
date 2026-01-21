import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackAdDto {
  @ApiProperty({
    description: 'Number of impressions/clicks to add',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count?: number = 1;
}
