import { ChevronLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROUTES } from "@/types/routes";

/** Placeholder minimal — détail billet complet en F4A-T8B. */
export function BookingDetailPlaceholderPage() {
  const { reservationId } = useParams<{ reservationId: string }>();

  return (
    <>
      <header className="mb-5 flex items-center gap-3">
        <Link
          to={ROUTES.bookings}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Retour aux réservations"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Détail du billet</h1>
      </header>

      <PageHeader
        title="Billet"
        description="Le détail complet de votre réservation arrive bientôt."
      />

      <Card className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">
          Cette page affichera prochainement les informations complètes de votre trajet et votre
          boarding pass (F4A-T8B / T8C).
        </p>
        {reservationId ? (
          <p className="break-all font-mono text-xs text-muted-foreground">{reservationId}</p>
        ) : null}
        <Link
          to={ROUTES.bookings}
          className="inline-flex min-h-touch items-center justify-center text-sm font-medium text-primary"
        >
          ← Retour à mes réservations
        </Link>
      </Card>
    </>
  );
}
