import { UserRole } from '../user/enums/user-role.enum';

export type StringValue = `${number}${'s' | 'm' | 'h' | 'd'}`;

export interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
