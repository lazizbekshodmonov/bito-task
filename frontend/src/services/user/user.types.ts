export const enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}
