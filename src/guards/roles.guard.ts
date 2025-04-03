import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES } from '../constants';
import { AuthUser } from '../interfaces/auth-user.interface';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admin can do anything
    if (user.role === USER_ROLES.ADMIN) {
      return true;
    }

    // For user-specific operations, check if the user is modifying their own data
    if (requiredRoles.includes('self')) {
      const userId = request.params.id;
      const isSelf = user.userId === userId;
      return isSelf;
    }

    return false;
  }
}
