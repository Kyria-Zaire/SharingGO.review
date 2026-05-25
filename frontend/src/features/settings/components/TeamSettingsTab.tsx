import { useMemo, useState } from "react";
import { ApiError } from "@/api/http";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { ChangeRoleModal } from "@/features/settings/components/ChangeRoleModal";
import { CreateUserPanel } from "@/features/settings/components/CreateUserPanel";
import { DisableUserConfirmation } from "@/features/settings/components/DisableUserConfirmation";
import {
  mapCreateUserError,
  mapDisableUserError,
  mapRoleChangeError,
} from "@/features/settings/utils/settings-error-messages";
import { UsersTable } from "@/features/settings/components/UsersTable";
import { useAdminUsersList, useAdminUsersMutations } from "@/features/settings/hooks/useAdminUsers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { AdminUserSafe, AdminUserStatus } from "@/types/admin-users.types";

export function TeamSettingsTab() {
  const currentUser = useCurrentUser();
  const [statusFilter, setStatusFilter] = useState<AdminUserStatus | "all">("ACTIVE");
  const [roleUser, setRoleUser] = useState<AdminUserSafe | null>(null);
  const [disableUser, setDisableUser] = useState<AdminUserSafe | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [disableError, setDisableError] = useState<string | null>(null);

  const filters = useMemo(() => {
    if (statusFilter === "all") {
      return { includeDisabled: true as const };
    }
    if (statusFilter === "DISABLED") {
      return { status: "DISABLED" as const };
    }
    return { status: "ACTIVE" as const };
  }, [statusFilter]);

  const listQuery = useAdminUsersList(filters);
  const { createMutation, roleMutation, disableMutation } = useAdminUsersMutations();

  const users = listQuery.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">
            Statut
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as AdminUserStatus | "all")
              }
              className="ml-2 flex h-9 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="all">Tous</option>
              <option value="ACTIVE">Actifs</option>
              <option value="DISABLED">Désactivés</option>
            </select>
          </label>
        </div>
        <CreateUserPanel
          isSubmitting={createMutation.isPending}
          errorMessage={createError}
          onDismissError={() => setCreateError(null)}
          onSubmit={(payload) => {
            setCreateError(null);
            createMutation.mutate(payload, {
              onSuccess: () => {
                setFeedback("Utilisateur créé.");
                setCreateError(null);
              },
              onError: (error) => setCreateError(mapCreateUserError(error)),
            });
          }}
        />
      </div>

      {feedback ? (
        <p className="text-sm text-primary" role="status">
          {feedback}
        </p>
      ) : null}

      {listQuery.isLoading ? <TableSkeleton rows={4} columns={6} /> : null}

      {listQuery.isError ? (
        <ErrorState
          message={
            listQuery.error instanceof ApiError
              ? listQuery.error.message
              : "Impossible de charger l'équipe"
          }
          onRetry={() => listQuery.refetch()}
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && users.length === 0 ? (
        <EmptyState
          badge="Équipe"
          title="Aucun utilisateur"
          description="Créez un chauffeur, admin ou convoyeur pour commencer."
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && users.length > 0 ? (
        <UsersTable
          users={users}
          currentUserId={currentUser.data?.id}
          onChangeRole={(user) => {
            setRoleError(null);
            setRoleUser(user);
          }}
          onDisable={(user) => {
            setDisableError(null);
            setDisableUser(user);
          }}
        />
      ) : null}

      {roleUser ? (
        <ChangeRoleModal
          user={roleUser}
          isSubmitting={roleMutation.isPending}
          errorMessage={roleError}
          onCancel={() => setRoleUser(null)}
          onConfirm={(userType) => {
            roleMutation.mutate(
              { userId: roleUser.id, userType },
              {
                onSuccess: () => {
                  setRoleUser(null);
                  setFeedback("Rôle mis à jour.");
                  setRoleError(null);
                },
                onError: (error) => setRoleError(mapRoleChangeError(error)),
              }
            );
          }}
        />
      ) : null}

      {disableUser ? (
        <DisableUserConfirmation
          user={disableUser}
          isSubmitting={disableMutation.isPending}
          errorMessage={disableError}
          onCancel={() => setDisableUser(null)}
          onConfirm={() => {
            disableMutation.mutate(disableUser.id, {
              onSuccess: () => {
                setDisableUser(null);
                setFeedback("Utilisateur désactivé.");
                setDisableError(null);
              },
              onError: (error) => setDisableError(mapDisableUserError(error)),
            });
          }}
        />
      ) : null}

      <p className="text-xs text-muted-foreground">
        Rôle OPERATOR : prévu en V2 (non présent dans l&apos;enum backend actuel).
      </p>
    </div>
  );
}
