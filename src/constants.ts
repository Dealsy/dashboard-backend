export const ERROR_CODES = {
  RECORD_NOT_FOUND: 'P2025',
  UNIQUE_CONSTRAINT_FAILED: 'P2002',
} as const;

export const USER_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_FETCHED: 'User fetched successfully',
  USERS_FETCHED: 'Users fetched successfully',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
