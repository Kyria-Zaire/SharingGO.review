import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROUTES } from "@/types/routes";

export function RegisterPage() {
  return (
    <>
      <PageHeader
        title="Inscription"
        description="Création de compte convoyeur — disponible dans un prochain ticket."
      />
      <Card>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          L&apos;inscription sera disponible prochainement.
        </p>
        <Link to={ROUTES.home} className="block">
          <Button variant="secondary" className="w-full">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </Card>
    </>
  );
}
