import { AuthError } from '../../modules/auth/enums/auth-error.enum';
import { UserError } from '../../modules/user/enums/user-error.enum';
import { ReservationError } from '../../modules/reservations/enums/reservation-error.enum';
import { GlobalError } from '../enums/global-error.enum';

export type AppExceptionCode = GlobalError | AuthError | UserError | ReservationError | string;

export interface LocalizedString {
  uz: string;
  ru: string;
  en: string;
  cyr: string;
}
