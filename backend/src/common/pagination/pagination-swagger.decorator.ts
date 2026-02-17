import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginationResponseDto } from './pagination-response.dto';

export function ApiPaginatedResponse<TModel extends Type<any>>(model: TModel, description = 'Paginated response') {
  return applyDecorators(
    ApiExtraModels(PaginationResponseDto, model),

    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDto) },
          {
            properties: {
              content: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}
