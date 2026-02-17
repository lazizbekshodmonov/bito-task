import { Body, Controller, Get, Headers, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtWebGuard } from '../auth/guards';
import { AuthenticatedUser } from '../auth/decorators';
import type { JwtPayload } from '../auth/auth.types';
import { ReservationsService } from './services/reservations.service';
import { ReserveSeatDto, ConfirmReservationDto, CancelReservationDto } from './dto';
import { ReservationEntity } from './entities/reservation.entity';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';
import { ReserveSwaggerDoc, ConfirmSwaggerDoc, CancelSwaggerDoc, FindMyReservationsSwaggerDoc } from './swagger/reservations.swagger';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtWebGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('reserve')
  @UseInterceptors(IdempotencyInterceptor)
  @ReserveSwaggerDoc()
  reserve(
    @Body() dto: ReserveSeatDto,
    @AuthenticatedUser() user: JwtPayload,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<ReservationEntity> {
    return this.reservationsService.reserveSeat(dto.seatId, user.sub, idempotencyKey);
  }

  @Post('confirm')
  @ConfirmSwaggerDoc()
  confirm(
    @Body() dto: ConfirmReservationDto,
    @AuthenticatedUser() user: JwtPayload,
  ): Promise<ReservationEntity> {
    return this.reservationsService.confirmReservation(dto.reservationId, user.sub);
  }

  @Post('cancel')
  @CancelSwaggerDoc()
  cancel(
    @Body() dto: CancelReservationDto,
    @AuthenticatedUser() user: JwtPayload,
  ): Promise<ReservationEntity> {
    return this.reservationsService.cancelReservation(dto.reservationId, user.sub);
  }

  @Get('my')
  @FindMyReservationsSwaggerDoc()
  findMy(@AuthenticatedUser() user: JwtPayload): Promise<ReservationEntity[]> {
    return this.reservationsService.findMyReservations(user.sub);
  }
}
