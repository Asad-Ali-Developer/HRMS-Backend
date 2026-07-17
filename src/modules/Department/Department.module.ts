import { Module } from '@nestjs/common';
import { DepartmentController } from '../../controllers';
import { DepartmentService, PrismaService } from '../../services';
@Module({
  controllers: [DepartmentController],
  providers: [DepartmentService, PrismaService],
  exports: [DepartmentService], // Export if other modules need to use this service
})
export class DepartmentModule {}
