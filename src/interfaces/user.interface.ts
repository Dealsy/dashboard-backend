import { UserRole } from '../constants';

export type UserInterface = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
