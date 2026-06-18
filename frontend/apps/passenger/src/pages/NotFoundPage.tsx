import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/types/routes";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <EmptyState
        badge="404"
        title="Page introuvable"
        description="Cette page n'existe pas dans l'application convoyeur."
        action={
          <Link to={ROUTES.home}>
            <Button variant="secondary">Retour à l&apos;accueil</Button>
          </Link>
        }
      />
    </div>
  );
}
