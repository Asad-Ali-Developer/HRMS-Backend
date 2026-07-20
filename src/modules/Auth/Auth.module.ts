import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../../controllers';
import { AuthService, PrismaService } from '../../services';
import { JwtStrategy } from '../../strategy';
import { RoleModule } from '../RBAC/Role.module';

@Module({
  imports: [JwtModule.register({}), RoleModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
