import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROUTES } from "@/types/routes";

export function BookingsPage() {
  return (
    <>
      <PageHeader
        title="Réservations"
        description="Vos trajets confirmés apparaîtront ici."
      />
      <Card className="space-y-4 text-center">
        <p className="text-base text-muted-foreground">
          Aucune réservation affichée pour le moment.
        </p>
        <p className="text-sm text-muted-foreground">
          Après un paiement Stripe réussi, votre réservation confirmée sera listée ici
          (historique complet — F4A-T8).
        </p>
        <Link
          to={ROUTES.trips}
          className="inline-flex min-h-touch w-full items-center justify-center rounded-md border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
        >
          Voir les trajets disponibles
        </Link>
      </Card>
    </>
  );
}
