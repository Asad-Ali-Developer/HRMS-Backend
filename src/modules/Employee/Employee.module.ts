import { Module } from '@nestjs/common';
import { EmployeeController } from '../../controllers/Employees/Employees.controller';
import { EmployeeService, PrismaService } from '../../services';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
