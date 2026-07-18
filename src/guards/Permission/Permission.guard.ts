import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../services';
import { PERMISSION_KEY, PermissionMetadata } from '../../decorators';


@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const permission =
      this.reflector.getAllAndOverride<PermissionMetadata>(
        PERMISSION_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user)
      throw new ForbiddenException(
        'User not authenticated.',
      );

    const rolePermission =
      await this.prisma.rolePermission.findFirst({
        where: {
          roleId: user.roleId,
          subModule: {
            name: permission.subModule,
          },
        },
      });

    if (!rolePermission)
      throw new ForbiddenException(
        'Permission denied.',
      );

    const allowed =
      rolePermission.actions.includes(
        permission.action,
      );

    if (!allowed)
      throw new ForbiddenException(
        'Permission denied.',
      );

    return true;
  }
}