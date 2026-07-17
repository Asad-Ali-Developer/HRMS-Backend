import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import JWTConfig from './config/JWT.config';
import {
  AdminModule,
  AuthModule,
  BranchModule,
  DepartmentModule,
  PrismaModule,
} from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [JWTConfig],
    }),
    PrismaModule,
    AdminModule,
    AuthModule,
    BranchModule,
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
