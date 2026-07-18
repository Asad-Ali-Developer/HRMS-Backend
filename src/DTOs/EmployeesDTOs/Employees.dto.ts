import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../../prisma/generated/prisma/browser';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEmployeeDto {
  @IsUUID()
  roleId: string;

  @IsUUID()
  branchId: string;

  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsUUID()
  departmentHeadId?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber('PK')
  personalPhone: string;

  @IsOptional()
  @IsPhoneNumber('PK')
  companyPhone?: string;

  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Salary must be a valid number',
    },
  )
  @Min(0)
  salary: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualLeaves?: number;

  @IsString()
  @IsNotEmpty()
  cnic: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  jd?: string;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
