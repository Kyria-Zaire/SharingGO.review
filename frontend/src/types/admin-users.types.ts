export const ADMIN_TEAM_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "DRIVER",
  "CONVOYEUR",
] as const;

export type AdminTeamRole = (typeof ADMIN_TEAM_ROLES)[number];

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
  userType: AdminTeamRole;
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

export interface AdminUserFilters {
  role?: AdminTeamRole;
  email?: string;
  status?: AdminUserStatus;
  /** true = inclure les comptes désactivés (sinon actifs seulement par défaut côté API). */
  includeDisabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateAdminUserPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  userType: AdminTeamRole;
  password: string;
}
