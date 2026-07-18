import { Module } from '@nestjs/common';
import { PermissionController } from '../../controllers';
import { PermissionService, PrismaService } from '../../services';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PrismaService],
})
export class PermissionModule {}
