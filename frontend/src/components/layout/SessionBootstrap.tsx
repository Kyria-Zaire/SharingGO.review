import type { ReactNode } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface SessionBootstrapProps {
  children: ReactNode;
}

/**
 * Blocks the router until the initial session probe (/api/auth/me) completes.
 * Prevents a blank screen while HttpOnly cookies are validated on cold load / Safari resume.
 */
export function SessionBootstrap({ children }: SessionBootstrapProps) {
  const { isPending } = useCurrentUser();

  if (isPending) {
    return <LoadingScreen message="Chargement de la session…" />;
  }

  return children;
}
