import { ArrayNotEmpty, IsArray, IsEnum, IsString } from 'class-validator';


import { PartialType } from '@nestjs/mapped-types';
import { PermissionAction } from '../../enums';

export class CreateRolePermissionDto {
  @IsString()
  roleId: string;

  @IsString()
  subModuleId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, {
    each: true,
  })
  actions: PermissionAction[];
}

export class UpdateRolePermissionDto extends PartialType(
  CreateRolePermissionDto,
) {}
