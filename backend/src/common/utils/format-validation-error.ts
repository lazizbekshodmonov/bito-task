import { ValidationError } from 'class-validator';

/**
 * Flattens nested validation errors into a flat array of error message strings.
 *
 * @param errors - The validation error array from class-validator
 * @returns A flat array of constraint message strings
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  const traverse = (errs: ValidationError[]) => {
    for (const err of errs) {
      if (err.constraints) {
        messages.push(...Object.values(err.constraints));
      }
      if (err.children && err.children.length > 0) {
        traverse(err.children);
      }
    }
  };

  traverse(errors);

  return messages;
}
