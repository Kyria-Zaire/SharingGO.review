export const USER_TYPES = [
  "PASSENGER",
  "CONVOYEUR",
  "DRIVER",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type UserType = (typeof USER_TYPES)[number];

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: UserType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}
