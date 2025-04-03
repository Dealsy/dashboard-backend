import { Module } from '@nestjs/common';
import { UsersController } from 'src/routes/users/users.controller';
import { UsersService } from '../services/users/users.service';
import { PrismaService } from '../services/prisma/prisma.service';
import { PasswordService } from '../services/auth/password.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
