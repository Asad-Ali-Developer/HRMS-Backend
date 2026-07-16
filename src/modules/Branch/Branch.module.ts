import { Module } from '@nestjs/common';
import { BranchController } from '../../controllers';
import { BranchService, PrismaService } from '../../services';

@Module({
  controllers: [BranchController],
  providers: [BranchService, PrismaService],
})
export class BranchModule {}
