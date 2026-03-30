import { envConfig } from '@/config/env.config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: envConfig.JWT_SECRET,
      signOptions: {
        expiresIn: envConfig.JWT_ACCESS_EXPIRE,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
