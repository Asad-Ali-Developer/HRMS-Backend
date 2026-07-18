import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import JWTConfig from './config/JWT.config';
import {
  AdminModule,
  AuthModule,
  BranchModule,
  DepartmentHeadModule,
  DepartmentModule,
  EmployeeModule,
  ModuleModule,
  PermissionModule,
  PrismaModule,
  RoleModule,
  SubModuleModule,
} from './modules';
import { getRedisCacheConfig } from './config';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [JWTConfig],
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRedisCacheConfig,
    }),

    PrismaModule,
    AdminModule,
    AuthModule,
    BranchModule,
    DepartmentModule,
    RoleModule,
    ModuleModule,
    SubModuleModule,
    PermissionModule,
    EmployeeModule,
    DepartmentHeadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
