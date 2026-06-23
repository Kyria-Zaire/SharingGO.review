import { useEffect, useMemo } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
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

  const pageTitle = isConfirmed
    ? "Réservation confirmée"
    : isTimeout
      ? "Paiement reçu"
      : "Paiement reçu";

  const pageDescription = isConfirmed
    ? "Votre place est confirmée sur la navette."
    : isTimeout
      ? "Votre paiement a bien été enregistré."
      : "Nous confirmons actuellement votre réservation.";

  return (
    <>
      <PageHeader title={pageTitle} description={pageDescription} />

      <Card className="space-y-4 text-center">
        {isConfirming ? (
          <Loader2
            className="mx-auto h-10 w-10 animate-spin text-primary"
            aria-hidden
          />
        ) : isTimeout ? (
          <Clock className="mx-auto h-10 w-10 text-warning" aria-hidden />
        ) : (
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" aria-hidden />
        )}

        <div className="space-y-2" role="status" aria-live="polite">
          {isConfirming ? (
            <>
              <p className="text-sm font-medium text-foreground">
                Finalisation en cours
              </p>
              <p className="text-sm text-muted-foreground">
                Nous confirmons actuellement votre réservation. Cela peut prendre
                jusqu&apos;à 30 secondes.
              </p>
              <p className="text-xs text-muted-foreground">
                Ne fermez pas cette page — vérification automatique en cours.
              </p>
            </>
          ) : isConfirmed ? (
            <>
              <p className="text-sm font-medium text-foreground">
                Votre réservation est confirmée
              </p>
              <p className="text-sm text-muted-foreground">
                Retrouvez votre billet dans « Mes réservations ». Votre QR
                d&apos;embarquement y sera disponible.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                Nous finalisons votre réservation
              </p>
              <p className="text-sm text-muted-foreground">
                Le paiement a bien été enregistré. La confirmation peut prendre
                encore quelques instants — consultez « Mes réservations » dans
                une minute.
              </p>
              <p className="text-xs text-muted-foreground">
                Si votre billet n&apos;apparaît pas après 2 minutes, contactez le
                support avec votre confirmation de paiement.
              </p>
            </>
          )}
        </div>

        {isConfirmed && reservationId ? (
          <p className="text-xs text-muted-foreground">
            Référence réservation :{" "}
            <span className="font-mono">{reservationId.slice(0, 8)}…</span>
          </p>
        ) : null}
      </Card>

      <div className="mt-6 space-y-3">
        {isConfirmed && reservationId ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate(ROUTES.bookingDetail(reservationId))}
          >
            Voir mon billet
          </Button>
        ) : null}

        <Button
          variant={isConfirmed ? "secondary" : "primary"}
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
