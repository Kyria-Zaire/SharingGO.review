import { useEffect, useMemo } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePaymentConfirmationPoll } from "@/hooks/usePaymentConfirmationPoll";
import {
  clearLastCheckout,
  resolveCheckoutContext,
} from "@/lib/checkout-session-storage";
import { ROUTES } from "@/types/routes";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get("session_id");
  const checkoutContext = useMemo(
    () => resolveCheckoutContext(urlSessionId),
    [urlSessionId]
  );

  const { state, reservationId } = usePaymentConfirmationPoll(checkoutContext);

  useEffect(() => {
    if (state === "confirmed") {
      clearLastCheckout();
    }
  }, [state]);

  const isConfirming = state === "confirming";
  const isConfirmed = state === "confirmed";
  const isTimeout = state === "timeout";

  return (
    <>
      <PageHeader
        title={isConfirmed ? "Réservation confirmée" : "Paiement reçu"}
        description={
          isConfirmed
            ? "Votre place est confirmée sur la navette."
            : isTimeout
              ? "Votre paiement est en cours de confirmation."
              : "Confirmation en cours…"
        }
      />

      <Card className="space-y-4 text-center">
        {isConfirming ? (
          <Loader2
            className="mx-auto h-10 w-10 animate-spin text-primary"
            aria-hidden
          />
        ) : (
          <CheckCircle2
            className={`mx-auto h-10 w-10 ${isConfirmed ? "text-primary" : "text-muted-foreground"}`}
            aria-hidden
          />
        )}

        <p className="text-sm text-foreground" role="status" aria-live="polite">
          {isConfirming
            ? "Paiement reçu, confirmation en cours…"
            : isConfirmed
              ? "Votre réservation est confirmée. Vous la retrouverez dans « Mes réservations »."
              : "Le paiement a bien été enregistré. La confirmation peut prendre quelques instants supplémentaires."}
        </p>

        {isConfirming ? (
          <p className="text-xs text-muted-foreground">
            Ne fermez pas cette page — vérification automatique en cours (jusqu&apos;à 1 minute).
          </p>
        ) : null}

        {isConfirmed && reservationId ? (
          <p className="text-xs text-muted-foreground">
            Référence réservation :{" "}
            <span className="font-mono">{reservationId.slice(0, 8)}…</span>
          </p>
        ) : null}
      </Card>

      <div className="mt-6 space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => navigate(ROUTES.bookings)}
        >
          Voir mes réservations
        </Button>
        <Button
          variant="secondary"
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
