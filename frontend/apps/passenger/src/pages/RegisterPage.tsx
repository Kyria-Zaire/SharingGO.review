import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthFormAlert } from "@/components/auth/AuthFormAlert";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { formatAuthError } from "@/lib/auth-errors";
import { passengerContentNarrowClass } from "@/lib/passenger-layout";
import { ROUTES } from "@/types/routes";

const registerSchema = z
  .object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z.string().trim().email("Email invalide"),
    password: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export function RegisterPage() {
  const { registerWithEmailPassword } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        firstName: issues.firstName?.[0],
        lastName: issues.lastName?.[0],
        email: issues.email?.[0],
        password: issues.password?.[0],
        confirmPassword: issues.confirmPassword?.[0],
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await registerWithEmailPassword({
        email: parsed.data.email,
        password: parsed.data.password,
        firstName: parsed.data.firstName || undefined,
        lastName: parsed.data.lastName || undefined,
      });
      navigate(ROUTES.bookings, { replace: true });
    } catch (error) {
      setErrorMessage(
        formatAuthError(error, "Impossible de créer le compte. Réessayez.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={passengerContentNarrowClass}>
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Créer un compte
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inscrivez-vous pour réserver votre place sur la navette.
        </p>
      </div>

      <Card className="p-5">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Prénom"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={fieldErrors.firstName}
              disabled={isSubmitting}
            />
            <Input
              label="Nom"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={fieldErrors.lastName}
              disabled={isSubmitting}
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            disabled={isSubmitting}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
          >
            Créer mon compte
          </Button>
        </form>

        {errorMessage ? (
          <div className="mt-4">
            <AuthFormAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
          </div>
        ) : null}
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          to={ROUTES.login}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
