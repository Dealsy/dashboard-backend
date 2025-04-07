import { UserRole } from '../constants';

export type UserInterface = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  address?: string;
  phone?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
};
