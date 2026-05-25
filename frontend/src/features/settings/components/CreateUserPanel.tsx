import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ADMIN_ROLE_LABELS } from "@/features/settings/constants/role-labels";
import { ADMIN_TEAM_ROLES, type AdminTeamRole, type CreateAdminUserPayload } from "@/types/admin-users.types";

const selectClassName =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function CreateUserPanel({
  onSubmit,
  isSubmitting,
  errorMessage,
  onDismissError,
}: {
  onSubmit: (payload: CreateAdminUserPayload) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onDismissError?: () => void;
}) {
  const [open, setOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const userType = data.get("userType") as AdminTeamRole;
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();

    if (!email || !password || password.length < 8) return;

    onSubmit({
      email,
      password,
      userType,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    });

    form.reset();
    setOpen(false);
    onDismissError?.();
  }

  if (!open) {
    return (
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        Ajouter un utilisateur
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
    >
      <p className="text-sm font-medium text-foreground">Nouvel utilisateur</p>
      <p className="text-xs text-muted-foreground">
        V1 : mot de passe initial saisi par l&apos;admin (min. 8 caractères), jamais stocké localement.
        À terme : génération aléatoire + email d&apos;invitation (hors scope actuel).
      </p>

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="email" type="email" placeholder="Email *" required />
        <select name="userType" className={selectClassName} defaultValue="DRIVER" required>
          {ADMIN_TEAM_ROLES.map((role) => (
            <option key={role} value={role}>
              {ADMIN_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        <Input name="firstName" placeholder="Prénom" />
        <Input name="lastName" placeholder="Nom" />
        <Input
          name="password"
          type="password"
          placeholder="Mot de passe initial (min. 8) *"
          minLength={8}
          required
          autoComplete="new-password"
          className="sm:col-span-2"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Créer
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
