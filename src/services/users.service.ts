import { Injectable } from '@nestjs/common';
import { UserInterface } from 'src/interfaces/user.interface';
import { PrismaService } from './prisma.service';
import { PasswordService } from './password.service';
import { tryCatchWrapper } from '../utils/try-catch-wrapper';
import { handlePrismaError } from '../utils/prisma-error-handler';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  private createUser = tryCatchWrapper(
    async (user: Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>) => {
      const hashedPassword = await this.passwordService.hashPassword(
        user.password,
      );

      return await this.prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          password: hashedPassword,
        },
      });
    },
    (error) => handlePrismaError(error),
  );

  async create(user: Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.createUser(user);
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  private findOneUser = tryCatchWrapper(
    async (id: string) => {
      const user = await this.prisma.user.findUnique({
        where: { id: parseInt(id) },
      });

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      return user;
    },
    (error) => handlePrismaError(error),
  );

  async findOne(id: string) {
    return this.findOneUser(id);
  }

  private findByEmailUser = tryCatchWrapper(
    async (email: string) => {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }

      return user;
    },
    (error) => handlePrismaError(error),
  );

  async findByEmail(email: string) {
    return this.findByEmailUser(email);
  }

  private updateUser = tryCatchWrapper(
    async (id: string, user: Partial<UserInterface>) => {
      const data: Prisma.UserUpdateInput = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      if (user.password) {
        data.password = await this.passwordService.hashPassword(user.password);
      }

      return await this.prisma.user.update({
        where: { id: parseInt(id) },
        data,
      });
    },
    (error) => handlePrismaError(error),
  );

  async update(id: string, user: Partial<UserInterface>) {
    return this.updateUser(id, user);
  }

  private deleteUser = tryCatchWrapper(
    async (id: string) => {
      return await this.prisma.user.delete({
        where: { id: parseInt(id) },
      });
    },
    (error, id) => handlePrismaError(error, id),
  );

  async delete(id: string) {
    return this.deleteUser(id);
  }
}
