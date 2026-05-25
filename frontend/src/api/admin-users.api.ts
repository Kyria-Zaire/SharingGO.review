import { buildQuery } from "@/lib/build-query";
import { http } from "./http";
import type {
  AdminUserFilters,
  AdminUserListResponse,
  AdminUserSafe,
  AdminTeamRole,
  CreateAdminUserPayload,
} from "@/types/admin-users.types";

export async function listAdminUsers(
  filters: AdminUserFilters = {}
): Promise<AdminUserListResponse> {
  const query = buildQuery({
    role: filters.role,
    email: filters.email,
    status: filters.status,
    includeDisabled: filters.includeDisabled,
    limit: filters.limit !== undefined ? String(filters.limit) : undefined,
    offset: filters.offset !== undefined ? String(filters.offset) : undefined,
  });
  return http<AdminUserListResponse>(`/api/admin/users${query}`);
}

export async function createAdminUser(payload: CreateAdminUserPayload): Promise<AdminUserSafe> {
  return http<AdminUserSafe>("/api/admin/users", { method: "POST", body: payload });
}

export async function updateAdminUserRole(
  userId: string,
  userType: AdminTeamRole
): Promise<AdminUserSafe> {
  return http<AdminUserSafe>(`/api/admin/users/${encodeURIComponent(userId)}/role`, {
    method: "PATCH",
    body: { userType },
  });
}

export async function disableAdminUser(userId: string): Promise<AdminUserSafe> {
  return http<AdminUserSafe>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}
