import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeatsService } from './services/seats.service';
import { SeatEntity } from './entities/seat.entity';
import { SeatFindAllSwaggerDoc } from './swagger/seats.swagger';

@ApiTags('Seats')
@Controller('seats')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  @SeatFindAllSwaggerDoc()
  findAll(): Promise<SeatEntity[]> {
    return this.seatsService.findAllWithActiveReservation();
  }
}
