import { Injectable } from '@nestjs/common';
import { UserInterface } from 'src/interfaces/user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../auth/password.service';
import { tryCatchWrapper } from '../../utils/try-catch-wrapper';
import { handlePrismaError } from '../../utils/prisma-error-handler';
import { Prisma, User } from '@prisma/client';
import { USER_ROLES } from '../../constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  private transformUser = (user: User): UserInterface => ({
    ...user,
    role: user.role as keyof typeof USER_ROLES,
  });

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
          role: user.role,
        },
      });
    },
    (error: unknown) => handlePrismaError(error),
  );

  async create(user: Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>) {
    const userWithRole = {
      ...user,
      role: user.role || USER_ROLES.USER,
    };
    const createdUser = await this.createUser(userWithRole);
    return this.transformUser(createdUser);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(this.transformUser);
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
    (error: unknown) => handlePrismaError(error),
  );

  async findOne(id: string) {
    const user = await this.findOneUser(id);
    return this.transformUser(user);
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
    (error: unknown) => handlePrismaError(error),
  );

  async findByEmail(email: string) {
    const user = await this.findByEmailUser(email);
    return this.transformUser(user);
  }

  private updateUser = tryCatchWrapper(
    async (id: string, user: Partial<UserInterface>) => {
      const updateData: Prisma.UserUpdateInput = {};

      if (user.email) updateData.email = user.email;
      if (user.firstName) updateData.firstName = user.firstName;
      if (user.lastName) updateData.lastName = user.lastName;
      if (user.role) {
        if (user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.USER) {
          throw new Error('Invalid role value');
        }
        updateData.role = user.role;
      }
      if (user.password) {
        updateData.password = await this.passwordService.hashPassword(
          user.password,
        );
      }

      return await this.prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
    },
    (error: unknown) => handlePrismaError(error),
  );

  async update(id: string, user: Partial<UserInterface>) {
    const updatedUser = await this.updateUser(id, user);
    return this.transformUser(updatedUser);
  }

  private deleteUser = tryCatchWrapper(
    async (id: string) => {
      return await this.prisma.user.delete({
        where: { id: parseInt(id) },
      });
    },
    (error: unknown, id: string) => handlePrismaError(error, id),
  );

  async delete(id: string) {
    const deletedUser = await this.deleteUser(id);
    return this.transformUser(deletedUser);
  }
}
