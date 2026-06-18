import type { UserType } from "@prisma/client";

export type AdminUserStatus = "ACTIVE" | "DISABLED";

export interface AdminUserCreatedBySafe {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminUserSafe {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: UserType;
  status: AdminUserStatus;
  createdAt: string;
  deletedAt: string | null;
  lastLoginAt: string | null;
  createdByUserId: string | null;
  createdBy: AdminUserCreatedBySafe | null;
}

export interface AdminUserListResponse {
  items: AdminUserSafe[];
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}
