import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDepartmentHeadDto {
  @IsUUID()
  departmentId: string;

  @IsUUID()
  employeeId: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateDepartmentHeadDto extends PartialType(
  CreateDepartmentHeadDto,
) {}
