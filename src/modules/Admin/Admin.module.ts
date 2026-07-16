// system.module.ts

import { Module } from '@nestjs/common';


import { AdminController } from '../../controllers';
import { AdminService } from '../../services';
import { PrismaModule } from '../PrismaModule/Prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}