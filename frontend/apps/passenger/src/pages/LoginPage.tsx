import { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/http";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

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
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Impossible de se connecter avec Google.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage("Connexion Google impossible. Réessayez ou fermez la popup si elle est bloquée.");
  };

  return (
    <div className="mx-auto w-full max-w-sm">
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
        <div
          className="flex justify-center"
          aria-busy={isSubmitting}
          aria-disabled={isSubmitting}
        >
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

        {errorMessage ? (
          <p className="mt-4 text-center text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {isSubmitting ? (
          <p className="mt-3 text-center text-sm text-muted-foreground" role="status">
            Connexion en cours…
          </p>
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
