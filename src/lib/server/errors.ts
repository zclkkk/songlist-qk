import type { ZodError } from 'zod';

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

const fallbackMessage = '操作失败，请稍后重试。';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof UserFacingError) {
    return error.message;
  }

  console.error(error);
  return fallbackMessage;
};

export const getValidationMessage = (error: ZodError) => error.issues[0].message;
