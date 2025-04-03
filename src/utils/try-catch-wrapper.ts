type AsyncFunction<TArgs extends unknown[], TReturn> = (
  ...args: TArgs
) => Promise<TReturn>;

type ErrorHandler<TArgs extends unknown[]> = (
  error: unknown,
  ...args: TArgs
) => void;

export function tryCatchWrapper<TArgs extends unknown[], TReturn>(
  func: AsyncFunction<TArgs, TReturn>,
  errorHandler?: ErrorHandler<TArgs>,
): AsyncFunction<TArgs, TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await func(...args);
    } catch (error) {
      if (!errorHandler) {
        console.error('Unhandled error:', error);
        throw error;
      }

      errorHandler(error, ...args);
      throw error;
    }
  };
}
