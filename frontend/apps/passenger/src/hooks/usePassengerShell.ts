import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

export interface PassengerShellState {
  isHome: boolean;
  isTripsDiscovery: boolean;
  isMarketingSurface: boolean;
  isAuthenticated: boolean;
  /** Footer marketing (page d'accueil). */
  showMarketingFooter: boolean;
  /** Variante header (marketing = liens visibles, pas de duplication route). */
  headerVariant: "marketing" | "app";
  /** Padding bas main (safe area iOS uniquement — pas de bottom nav web). */
  mainBottomPadding: string;
}

export function usePassengerShell(): PassengerShellState {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  return useMemo(() => {
    const isHome = pathname === ROUTES.home;
    const isTripsDiscovery = pathname === ROUTES.trips;
    const isMarketingSurface = isHome || isTripsDiscovery;

    return {
      isHome,
      isTripsDiscovery,
      isMarketingSurface,
      isAuthenticated,
      showMarketingFooter: isMarketingSurface,
      headerVariant: isHome && !isAuthenticated ? "marketing" : "app",
      mainBottomPadding: "env(safe-area-inset-bottom, 0px)",
    };
  }, [pathname, isAuthenticated]);
}
