/** Aligné sur `UserSafe` backend (Prisma UserType sans PASSENGER). */
export type PassengerUserType = "CONVOYEUR" | "DRIVER" | "ADMIN" | "SUPER_ADMIN";

export interface PassengerUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: PassengerUserType;
}
