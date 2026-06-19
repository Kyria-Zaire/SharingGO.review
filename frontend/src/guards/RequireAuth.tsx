import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ApiError } from "@/api/http";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const { data: user, isPending, isError, error, refetch } = useCurrentUser();

  if (isPending) {
    return <LoadingScreen message="Chargement de la session…" />;
  }

  const unauthorized = isError && error instanceof ApiError && error.status === 401;

  if (isError && !unauthorized) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Impossible de vérifier la session";

    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-background p-6">
        <ErrorState message={message} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (unauthorized || !user) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}
