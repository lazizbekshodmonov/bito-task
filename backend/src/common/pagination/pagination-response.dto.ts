import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export class PaginationResponseDto<T> {
  @ApiProperty({ isArray: true, description: 'List of data' })
  content: T[];
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;
  @ApiProperty({ example: 1, description: 'Page size' })
  size: number;
  @ApiProperty({ example: 1, description: 'Total number of elements' })
  totalElements: number;
  @ApiProperty({ example: 1, description: 'Total number of pages' })
  totalPages: number;
  @ApiProperty({ example: false, description: 'Is there a next page?' })
  hasNext: boolean;
}

export const SwaggerPaginatedResponseDto = <TModel extends Type<any>>(model: TModel) => {
  @ApiExtraModels(PaginationResponseDto, model)
  class PaginatedSwaggerDto extends PaginationResponseDto<InstanceType<TModel>> {
    @ApiProperty({
      type: model,
      isArray: true,
    })
    declare content: InstanceType<TModel>[];
  }

  return PaginatedSwaggerDto;
};
