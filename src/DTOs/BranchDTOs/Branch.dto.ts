import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Lahore Main Branch' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '24-B, Gulberg III, Lahore' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'lahore@hrms.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+923001234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @ApiPropertyOptional({ example: '+924235678901' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'landline must be a valid phone number',
  })
  landline?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
