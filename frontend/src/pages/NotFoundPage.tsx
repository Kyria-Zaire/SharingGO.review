import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <EmptyState
        badge="404"
        title="Page introuvable"
        description="Cette route n’existe pas dans le cockpit admin SharingGO."
        action={
          <Link to={ROUTES.dashboard}>
            <Button variant="secondary">Retour au dashboard</Button>
          </Link>
        }
      />
    </div>
  );
}
