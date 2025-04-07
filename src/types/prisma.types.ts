import type { Prisma } from '@prisma/client';

export type PrismaNumericAggregate = {
  _sum: {
    [key: string]: number | null;
  } | null;
  _count?: {
    _all: number;
  };
};

export type PrismaGroupByResult<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K];
} & {
  _sum: {
    [key: string]: number | null;
  };
  _count: {
    _all: number;
  };
};
