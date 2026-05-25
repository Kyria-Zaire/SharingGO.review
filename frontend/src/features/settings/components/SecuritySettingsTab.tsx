import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ADMIN_ROLE_DESCRIPTIONS, ADMIN_ROLE_LABELS } from "@/features/settings/constants/role-labels";
import { ADMIN_TEAM_ROLES } from "@/types/admin-users.types";

export function SecuritySettingsTab() {
  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
      <h3 className="text-base font-medium text-foreground">Sécurité & rôles</h3>

      <section>
        <p className="font-medium text-foreground">Hiérarchie V1</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {ADMIN_TEAM_ROLES.map((role) => (
            <li key={role}>
              <span className="text-foreground">{ADMIN_ROLE_LABELS[role]}</span> —{" "}
              {ADMIN_ROLE_DESCRIPTIONS[role]}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs">
          OPERATOR : rôle futur pour dispatch partagé multi-opérateur (non implémenté).
        </p>
      </section>

      <section>
        <p className="font-medium text-foreground">Session</p>
        <p>Authentification par cookie HttpOnly côté backend (Better Auth pattern session table).</p>
      </section>

      <section>
        <p className="font-medium text-foreground">À venir</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Audit trail complet (actions équipe)</li>
          <li>2FA admin</li>
          <li>Politique mot de passe configurable</li>
          <li>Invitations email</li>
        </ul>
      </section>

      <p>
        Flux opérationnel : <Link to={ROUTES.dispatch} className="text-primary hover:underline">Dispatch</Link>
      </p>
    </div>
  );
}
