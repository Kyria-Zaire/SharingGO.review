import type { UserType } from "@prisma/client";

export interface SafeUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: UserType;
}

export type AuthAuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "REGISTER_SUCCESS";
