import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/features/settings/components/RoleBadge";
import { UserStatusBadge } from "@/features/settings/components/UserStatusBadge";
import { relativeTime } from "@/lib/relativeTime";
import type { AdminUserSafe } from "@/types/admin-users.types";

function displayName(user: AdminUserSafe): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "—";
}

function formatLastLogin(lastLoginAt: string | null): string {
  if (!lastLoginAt) return "Non disponible";
  return relativeTime(lastLoginAt);
}

interface UsersTableProps {
  users: AdminUserSafe[];
  currentUserId?: string;
  onChangeRole: (user: AdminUserSafe) => void;
  onDisable: (user: AdminUserSafe) => void;
}

function UserActions({
  user,
  isSelf,
  disabled,
  onChangeRole,
  onDisable,
}: {
  user: AdminUserSafe;
  isSelf: boolean;
  disabled: boolean;
  onChangeRole: (user: AdminUserSafe) => void;
  onDisable: (user: AdminUserSafe) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        variant="secondary"
        size="sm"
        className="w-full sm:w-auto"
        disabled={disabled || isSelf}
        onClick={() => onChangeRole(user)}
      >
        Changer rôle
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="w-full sm:w-auto"
        disabled={disabled || isSelf}
        onClick={() => onDisable(user)}
      >
        Désactiver
      </Button>
    </div>
  );
}

function UserMobileCard({
  user,
  currentUserId,
  onChangeRole,
  onDisable,
}: {
  user: AdminUserSafe;
  currentUserId?: string;
  onChangeRole: (user: AdminUserSafe) => void;
  onDisable: (user: AdminUserSafe) => void;
}) {
  const isSelf = user.id === currentUserId;
  const disabled = user.status === "DISABLED";

  return (
    <article className="min-w-0 rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 min-w-0">
        <p className="font-medium text-foreground">{displayName(user)}</p>
        <p className="break-all text-xs text-muted-foreground">{user.email}</p>
        {isSelf ? <p className="mt-1 text-xs text-primary">Vous</p> : null}
      </div>
      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Rôle</dt>
          <dd className="mt-1">
            <RoleBadge role={user.userType} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Statut</dt>
          <dd className="mt-1">
            <UserStatusBadge status={user.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Créé</dt>
          <dd className="mt-1 text-foreground">
            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Dernière connexion</dt>
          <dd className="mt-1 text-foreground">{formatLastLogin(user.lastLoginAt)}</dd>
        </div>
      </dl>
      <UserActions
        user={user}
        isSelf={isSelf}
        disabled={disabled}
        onChangeRole={onChangeRole}
        onDisable={onDisable}
      />
    </article>
  );
}

export function UsersTable({ users, currentUserId, onChangeRole, onDisable }: UsersTableProps) {
  return (
    <>
      <div className="space-y-3 lg:hidden">
        {users.map((user) => (
          <UserMobileCard
            key={user.id}
            user={user}
            currentUserId={currentUserId}
            onChangeRole={onChangeRole}
            onDisable={onDisable}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Créé</th>
              <th className="px-4 py-3 font-medium">Dernière connexion</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const disabled = user.status === "DISABLED";

              return (
                <tr key={user.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{displayName(user)}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {isSelf ? <p className="text-xs text-primary">Vous</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.userType} />
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatLastLogin(user.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions
                      user={user}
                      isSelf={isSelf}
                      disabled={disabled}
                      onChangeRole={onChangeRole}
                      onDisable={onDisable}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
