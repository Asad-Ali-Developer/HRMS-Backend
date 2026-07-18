import { Module } from '@nestjs/common';
import { DepartmentHeadController } from '../../controllers';
import { DepartmentHeadService, PrismaService } from '../../services';

@Module({
  controllers: [DepartmentHeadController],
  providers: [DepartmentHeadService, PrismaService],
  exports: [DepartmentHeadService],
})
export class DepartmentHeadModule {}
