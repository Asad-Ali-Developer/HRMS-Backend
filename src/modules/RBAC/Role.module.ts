import { Module } from '@nestjs/common';
import { RoleController } from '../../controllers';
import { PrismaService, RoleService } from '../../services';

@Module({
  controllers: [RoleController],
  providers: [RoleService, PrismaService],
  exports: [RoleService],
})
export class RoleModule {}