import { PaginationRequestDto } from './pagination-request.dto';
import { PaginationResponseDto } from './pagination-response.dto';

export class Pagination {
  /**
   * Creates a paginated response from the given data.
   *
   * @param pagination - The pagination request containing page and size
   * @param totalElements - Total number of elements across all pages
   * @param dtos - The data items for the current page
   * @returns A paginated response with metadata
   */
  public static of<T>({ size = 10, page = 0 }: PaginationRequestDto, totalElements: number, dtos: T[]): PaginationResponseDto<T> {
    const safeSize = Math.max(size, 1);
    const safePage = Math.max(page, 0); // 0-based

    const totalPages = Math.ceil(totalElements / safeSize);
    const currentPage = safePage;
    const hasNext = currentPage < totalPages - 1;

    return {
      content: dtos,
      size: size,
      page: currentPage,
      totalPages,
      totalElements,
      hasNext,
    };
  }
}
