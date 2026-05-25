import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/features/settings/components/RoleBadge";
import type { AdminUserSafe } from "@/types/admin-users.types";

export function DisableUserConfirmation({
  user,
  onConfirm,
  onCancel,
  isSubmitting,
  errorMessage,
}: {
  user: AdminUserSafe;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}) {
  function handleConfirm() {
    const ok = window.confirm(
      `Désactiver ${user.email} ? L'utilisateur ne pourra plus se connecter.`
    );
    if (!ok) return;
    onConfirm();
  }

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <p className="text-sm font-semibold text-foreground">Désactiver l&apos;utilisateur</p>
      <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
      <div className="mt-2">
        <RoleBadge role={user.userType} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Soft delete — le compte passe en statut Désactivé. Aucune suppression définitive.
      </p>

      {errorMessage ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2">
        <Button variant="destructive" onClick={handleConfirm} isLoading={isSubmitting}>
          Confirmer la désactivation
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
