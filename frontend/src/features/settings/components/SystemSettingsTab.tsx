import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { env } from "@/lib/env";

export function SystemSettingsTab() {
  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
      <h3 className="text-base font-medium text-foreground">Système</h3>
      <ul className="space-y-2">
        <li>
          <span className="text-foreground">API</span> — {env.apiUrl}
        </li>
        <li>
          <span className="text-foreground">Temps réel</span> — désactivé (polling 30s sur Dispatch / Activité)
        </li>
        <li>
          <span className="text-foreground">OpenAPI</span> — disponible dans le dépôt (
          <code className="text-xs">docs/api/openapi.json</code>)
        </li>
        <li>
          <span className="text-foreground">Monitoring</span> —{" "}
          <Link to={ROUTES.monitoring} className="text-primary hover:underline">
            console monitoring
          </Link>
        </li>
      </ul>
    </div>
  );
}
