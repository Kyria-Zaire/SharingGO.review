import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserType } from "@/types/auth.types";

interface RequireRoleProps {
  allowedRoles: UserType[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ allowedRoles, children, fallback }: RequireRoleProps) {
  const { data: user, isPending } = useCurrentUser();

  if (isPending && !user) {
    return <LoadingScreen message="Chargement de la session…" />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowedRoles.includes(user.userType)) {
    return (
      fallback ?? (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <EmptyState
            badge="Accès refusé"
            title="Espace non autorisé"
            description="Ce cockpit admin est réservé aux rôles ADMIN et SUPER_ADMIN. Les espaces DRIVER et convoyeur seront disponibles dans une application dédiée."
          />
        </div>
      )
    );
  }

  return children;
}
