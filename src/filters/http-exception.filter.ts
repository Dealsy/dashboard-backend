import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { Response, Request } from 'express';

type ErrorHandler = (
  error: unknown,
) => { status: HttpStatus; message: string } | null;

const errorHandlers: ErrorHandler[] = [
  (error) => {
    if (error instanceof HttpException) {
      return {
        status: error.getStatus(),
        message: error.message,
      };
    }
    return null;
  },
  (error) => {
    if (error instanceof UserNotFoundException) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: error.message,
      };
    }
    return null;
  },
  (error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaErrorMap = {
        P2002: {
          status: HttpStatus.CONFLICT,
          message: 'Unique constraint violation',
        },
        P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
        P2014: { status: HttpStatus.BAD_REQUEST, message: 'Invalid ID' },
      } as const;

      return prismaErrorMap[error.code as keyof typeof prismaErrorMap] ?? null;
    }
    return null;
  },
];

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = errorHandlers.reduce<{
      status: HttpStatus;
      message: string;
    } | null>((result, handler) => result ?? handler(exception), null) ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };

    response.status(errorResponse.status).json({
      statusCode: errorResponse.status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorResponse.message,
    });
  }
}
