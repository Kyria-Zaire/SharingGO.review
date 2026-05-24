import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ApiError } from "@/api/http";

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const { data: user, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const unauthorized = isError && error instanceof ApiError && error.status === 401;

  if (unauthorized || !user) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}
