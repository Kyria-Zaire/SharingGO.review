import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { passengerContentNarrowClass } from "@/lib/passenger-layout";
import { ROUTES } from "@/types/routes";

function formatLoginError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0 || error.code === "NETWORK_ERROR") {
      return "Connexion impossible — vérifiez votre réseau et réessayez.";
    }
    return error.message;
  }
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return "Connexion impossible — vérifiez votre réseau et réessayez.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Impossible de se connecter avec Google.";
}

export function LoginPage() {
  const { loginWithGoogleCredential } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.trips;

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setErrorMessage("Connexion Google annulée ou identifiant absent.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await loginWithGoogleCredential(response.credential);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(formatLoginError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage(
      "Connexion Google impossible. Réessayez ou autorisez les popups si votre navigateur les bloque."
    );
  };

  const clearError = () => setErrorMessage(null);

  return (
    <div className={passengerContentNarrowClass}>
      <div className="mb-8 text-center">
        <p className="text-[0.65rem] font-medium uppercase tracking-widest text-primary">
          SharingGO
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Connexion convoyeur
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connectez-vous avec Google pour réserver votre place sur la navette Châlons ↔
          Paris-Vatry.
        </p>
      </div>

      <Card className="p-5">
        {isSubmitting ? (
          <div
            className="flex flex-col items-center gap-3 py-4 text-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">Connexion en cours…</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Vérification de votre compte Google
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(response) => void handleGoogleSuccess(response)}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="280"
            />
          </div>
        )}

        {errorMessage ? (
          <div
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center"
            role="alert"
          >
            <AlertCircle
              className="mx-auto mb-2 h-5 w-5 text-destructive"
              aria-hidden
            />
            <p className="text-sm text-destructive">{errorMessage}</p>
            <button
              type="button"
              className="mt-3 text-xs font-medium text-primary underline-offset-2 hover:underline"
              onClick={clearError}
            >
              Réessayer
            </button>
          </div>
        ) : null}
      </Card>

      <Link
        to={ROUTES.trips}
        className="mt-6 inline-flex min-h-touch w-full items-center justify-center text-sm font-medium text-primary"
      >
        ← Retour aux trajets
      </Link>
    </div>
  );
}
