import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export function IsOptionalBoolean() {
  return applyDecorators(
    IsOptional(),
    IsIn([true, false], { message: '$property must be true or false' }),
    Transform(({ obj, key }) => {
      if (typeof obj !== 'object' || obj === null) {
        return undefined;
      }

      const raw = (obj as Record<string, unknown>)[key];

      if (typeof raw === 'string') {
        const lower = raw.trim().toLowerCase();
        if (lower === 'true') return true;
        if (lower === 'false') return false;
        return undefined;
      }

      if (typeof raw === 'boolean') {
        return raw;
      }

      return undefined;
    }),
  );
}
