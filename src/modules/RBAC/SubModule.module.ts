import { Module } from '@nestjs/common';
import { SubModuleController } from '../../controllers';
import { PrismaService, SubModuleService } from '../../services';

@Module({
  controllers: [SubModuleController],
  providers: [SubModuleService, PrismaService],
  exports: [SubModuleService],
})
export class SubModuleModule {}