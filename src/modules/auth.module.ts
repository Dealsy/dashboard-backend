import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth/auth.service';
import { AuthController } from '../routes/auth/auth.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PasswordService } from '../services/auth/password.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from './users.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const jwtExpiration = configService.get<string>('JWT_EXPIRATION', '1h');

        if (!jwtSecret) {
          throw new Error('JWT_SECRET is not defined');
        }

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: jwtExpiration },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService],
  exports: [AuthService],
})
export class AuthModule {}
