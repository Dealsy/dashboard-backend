import { UserRole } from '../constants';

export type AuthUser = {
  userId: string;
  email: string;
  role: UserRole;
};
