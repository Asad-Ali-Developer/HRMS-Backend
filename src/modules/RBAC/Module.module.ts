import { Module } from '@nestjs/common';
import { ModuleController } from '../../controllers';
import { ModuleService, PrismaService } from '../../services';

@Module({
  controllers: [ModuleController],
  providers: [ModuleService, PrismaService],
  exports: [ModuleService],
})
export class ModuleModule {}
