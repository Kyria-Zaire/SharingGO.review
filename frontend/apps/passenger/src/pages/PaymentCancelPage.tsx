import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { readLastCheckout } from "@/lib/checkout-session-storage";
import { ROUTES } from "@/types/routes";

export function PaymentCancelPage() {
  const navigate = useNavigate();
  const lastCheckout = readLastCheckout();
  const pendingHref =
    lastCheckout?.pendingReservationId
      ? ROUTES.pendingBooking(lastCheckout.pendingReservationId)
      : null;

  return (
    <>
      <PageHeader
        title="Paiement annulé"
        description="Vous pouvez réessayer tant que le compteur est actif."
      />

      <Card className="space-y-4 text-center">
        <XCircle className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
        <p className="text-sm text-foreground">
          Le paiement a été interrompu. Votre place reste réservée temporairement
          tant que le délai de 2 minutes n&apos;est pas écoulé.
        </p>
        <p className="text-xs text-muted-foreground">
          Aucun montant n&apos;a été débité. Vous pouvez reprendre le paiement ou libérer votre
          place depuis la page de réservation temporaire.
        </p>
      </Card>

      <div className="mt-6 space-y-3">
        {pendingHref ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate(pendingHref)}
          >
            Reprendre le paiement
          </Button>
        ) : null}
        <Button
          variant={pendingHref ? "secondary" : "primary"}
          size="lg"
          className="w-full"
          onClick={() => navigate(ROUTES.trips)}
        >
          Retour aux trajets
        </Button>
      </div>
    </>
  );
}
