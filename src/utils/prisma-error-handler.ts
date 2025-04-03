import { Prisma } from '@prisma/client';
import { ERROR_CODES } from '../constants';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

export function handlePrismaError(error: unknown, id?: string): void {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    throw error;
  }

  if (error.code === ERROR_CODES.UNIQUE_CONSTRAINT_FAILED) {
    throw new Error('Email already exists');
  }

  if (error.code === ERROR_CODES.RECORD_NOT_FOUND && id) {
    throw new UserNotFoundException(id);
  }

  throw error;
}
