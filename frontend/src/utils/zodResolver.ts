import type { FieldValues, Resolver, FieldErrors } from 'react-hook-form';
import { ZodSchema } from 'zod';

export const zodResolver = <T extends FieldValues>(schema: ZodSchema<T>): Resolver<T> => {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors = result.error.errors.reduce((acc, current) => {
      const field = current.path.join('.') as keyof T;
      acc[field] = {
        type: current.code,
        message: current.message,
      } as any;
      return acc;
    }, {} as any) as FieldErrors<T>;

    return {
      values: {},
      errors,
    };
  };
};
