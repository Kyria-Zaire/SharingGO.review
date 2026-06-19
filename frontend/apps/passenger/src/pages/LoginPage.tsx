import { useState, type FormEvent } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthFormAlert } from "@/components/auth/AuthFormAlert";
import { DevDemoAuthHint } from "@/components/auth/DevDemoAuthHint";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { formatAuthError } from "@/lib/auth-errors";
import { passengerContentNarrowClass } from "@/lib/passenger-layout";
import { ROUTES } from "@/types/routes";

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type SubmitMode = "google" | "email" | null;

export function LoginPage() {
  const { loginWithGoogleCredential, loginWithEmailPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.bookings;

  const isBusy = submitMode !== null;

  async function completeLogin(action: () => Promise<unknown>) {
    try {
      await action();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(formatAuthError(error, "Impossible de se connecter."));
    } finally {
      setSubmitMode(null);
    }
  }

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setErrorMessage("Connexion Google annulée ou identifiant absent.");
      return;
    }

    setSubmitMode("google");
    setErrorMessage(null);
    await completeLogin(() => loginWithGoogleCredential(response.credential!));
  };

  const handleGoogleError = () => {
    setErrorMessage(
      "Connexion Google impossible. Réessayez ou autorisez les popups si votre navigateur les bloque."
    );
  };

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: issues.email?.[0],
        password: issues.password?.[0],
      });
      return;
    }

    setFieldErrors({});
    setSubmitMode("email");
    void completeLogin(() =>
      loginWithEmailPassword(parsed.data.email, parsed.data.password)
    );
  }

  function fillDemoCredentials(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFieldErrors({});
    setErrorMessage(null);
  }

  return (
    <div className={passengerContentNarrowClass}>
      <div className="mb-8 text-center">
        <p className="text-[0.65rem] font-medium uppercase tracking-widest text-primary">
          SharingGO
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Connexion
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Réservez et consultez vos billets sur la navette Châlons ↔ Paris-Vatry.
        </p>
      </div>

      <Card className="space-y-5 p-5">
        {submitMode === "google" ? (
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

        {submitMode !== "google" ? (
          <>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                ou
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <form className="space-y-4" onSubmit={handleEmailSubmit} noValidate>
              <Input
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors.email}
                disabled={isBusy}
                required
              />
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
                disabled={isBusy}
                required
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={submitMode === "email"}
                disabled={isBusy}
              >
                Se connecter
              </Button>
            </form>

            <DevDemoAuthHint onUseDemo={fillDemoCredentials} />
          </>
        ) : null}

        {errorMessage ? (
          <AuthFormAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        ) : null}
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          to={ROUTES.register}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Créer un compte
        </Link>
      </p>

      <Link
        to={ROUTES.trips}
        className="mt-4 inline-flex min-h-touch w-full items-center justify-center text-sm font-medium text-primary"
      >
        ← Retour aux trajets
      </Link>
    </div>
  );
}
