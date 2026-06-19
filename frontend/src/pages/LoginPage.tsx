import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { login } from "@/api/auth.api";
import { ApiError } from "@/api/http";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { queryKeys } from "@/constants/query-keys";
import { ADMIN_PANEL_ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { invalidateAuthQueries } from "@/lib/query";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isPending } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await invalidateAuthQueries(queryClient);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from ?? ROUTES.dashboard, { replace: true });
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : "Connexion impossible");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

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
    loginMutation.mutate(parsed.data);
  }

  if (isPending) {
    return <LoadingScreen message="Chargement de la session…" />;
  }

  if (user && ADMIN_PANEL_ROLES.includes(user.userType)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 space-y-1 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">SharingGO</p>
          <h1 className="text-xl font-semibold text-foreground">Connexion admin</h1>
          <p className="text-sm text-muted-foreground">
            Session par cookie HttpOnly — aucun token stocké côté navigateur.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
            Se connecter
          </Button>
        </form>
      </Card>
    </div>
  );
}
