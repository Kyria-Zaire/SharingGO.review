/** Aligné sur `UserSafe` backend (Prisma UserType sans PASSENGER). */
export const PASSENGER_USER_TYPES = [
  "CONVOYEUR",
  "DRIVER",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type PassengerUserType = (typeof PASSENGER_USER_TYPES)[number];

export interface PassengerUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: PassengerUserType;
}
