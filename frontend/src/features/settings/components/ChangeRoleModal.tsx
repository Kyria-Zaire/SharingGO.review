import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/features/settings/components/RoleBadge";
import {
  ADMIN_ROLE_DESCRIPTIONS,
  ADMIN_ROLE_LABELS,
  isDowngrade,
} from "@/features/settings/constants/role-labels";
import { ADMIN_TEAM_ROLES, type AdminTeamRole, type AdminUserSafe } from "@/types/admin-users.types";

const selectClassName =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ChangeRoleModal({
  user,
  onConfirm,
  onCancel,
  isSubmitting,
  errorMessage,
}: {
  user: AdminUserSafe;
  onConfirm: (userType: AdminTeamRole) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  const [nextRole, setNextRole] = useState<AdminTeamRole>(user.userType);
  const downgrade = isDowngrade(user.userType, nextRole);

  function handleConfirm() {
    if (nextRole === user.userType) {
      onCancel();
      return;
    }
    if (downgrade) {
      const ok = window.confirm(
        `Confirmer le passage de ${ADMIN_ROLE_LABELS[user.userType]} vers ${ADMIN_ROLE_LABELS[nextRole]} ?`
      );
      if (!ok) return;
    }
    onConfirm(nextRole);
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-lg">
      <p className="text-sm font-semibold text-foreground">Changer le rôle</p>
      <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
      <div className="mt-2">
        <RoleBadge role={user.userType} />
      </div>

      <label className="mt-4 block text-sm text-muted-foreground">
        Nouveau rôle
        <select
          className={`${selectClassName} mt-1`}
          value={nextRole}
          onChange={(event) => setNextRole(event.target.value as AdminTeamRole)}
        >
          {ADMIN_TEAM_ROLES.map((role) => (
            <option key={role} value={role}>
              {ADMIN_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs text-muted-foreground">{ADMIN_ROLE_DESCRIPTIONS[nextRole]}</p>

      {errorMessage ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <Button onClick={handleConfirm} isLoading={isSubmitting}>
          Enregistrer
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
