import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatStatus } from '../enums/seat-status.enum';
import { SeatCategory } from '../enums/seat-category.enum';

export class SeatResponseDto {
  @ApiProperty({ description: 'Seat ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'Seat label', example: 'A1' })
  label: string;

  @ApiProperty({ description: 'Row letter', example: 'A' })
  row: string;

  @ApiProperty({ description: 'Seat number in row', example: 1 })
  number: number;

  @ApiProperty({ description: 'Seat status', enum: SeatStatus, example: SeatStatus.AVAILABLE })
  status: SeatStatus;

  @ApiProperty({ description: 'Seat category', enum: SeatCategory, example: SeatCategory.VIP })
  category: SeatCategory;

  @ApiProperty({ description: 'Seat price', example: 10000 })
  price: number;

  @ApiPropertyOptional({ description: 'Active reservations', type: 'array', items: { type: 'object' } })
  reservations?: unknown[];
}
