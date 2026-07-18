import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../../../prisma/generated/prisma/client';

export const PERMISSION_KEY = 'permission';

export interface PermissionMetadata {
  subModule: string;
  action: PermissionAction;
}

export const Permission = (subModule: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, {
    subModule,
    action,
  });
