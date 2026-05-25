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

export function UsersTable({
  users,
  currentUserId,
  onChangeRole,
  onDisable,
}: {
  users: AdminUserSafe[];
  currentUserId?: string;
  onChangeRole: (user: AdminUserSafe) => void;
  onDisable: (user: AdminUserSafe) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
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
                  {isSelf ? (
                    <p className="text-xs text-primary">Vous</p>
                  ) : null}
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
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={disabled || isSelf}
                      onClick={() => onChangeRole(user)}
                    >
                      Changer rôle
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={disabled || isSelf}
                      onClick={() => onDisable(user)}
                    >
                      Désactiver
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
