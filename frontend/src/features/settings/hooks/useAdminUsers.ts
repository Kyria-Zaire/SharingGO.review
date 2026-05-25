import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  disableAdminUser,
  listAdminUsers,
  updateAdminUserRole,
} from "@/api/admin-users.api";
import { queryKeys } from "@/constants/query-keys";
import type {
  AdminUserFilters,
  AdminTeamRole,
  CreateAdminUserPayload,
} from "@/types/admin-users.types";

const TEAM_STALE_MS = 30_000;

export function useAdminUsersList(filters: AdminUserFilters = {}) {
  const filterKey = { ...filters };

  return useQuery({
    queryKey: queryKeys.settings.team(filterKey),
    queryFn: () => listAdminUsers({ limit: 50, offset: 0, ...filters }),
    staleTime: TEAM_STALE_MS,
  });
}

export function useAdminUsersMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.teamAll });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: invalidate,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, userType }: { userId: string; userType: AdminTeamRole }) =>
      updateAdminUserRole(userId, userType),
    onSuccess: invalidate,
  });

  const disableMutation = useMutation({
    mutationFn: (userId: string) => disableAdminUser(userId),
    onSuccess: invalidate,
  });

  return { createMutation, roleMutation, disableMutation };
}
