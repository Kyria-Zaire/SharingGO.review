import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

export interface PassengerShellState {
  isHome: boolean;
  isAuthenticated: boolean;
  /** Landing anonyme : pas de bottom nav. */
  showBottomNav: boolean;
  /** Footer marketing (page d'accueil). */
  showMarketingFooter: boolean;
  /** Variante header (marketing = liens visibles, pas de duplication route). */
  headerVariant: "marketing" | "app";
  /** Padding bas main pour bottom nav. */
  mainBottomPadding: string;
}

export function usePassengerShell(): PassengerShellState {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  return useMemo(() => {
    const isHome = pathname === ROUTES.home;
    const showBottomNav = !isHome || isAuthenticated;
    const showMarketingFooter = isHome;

    return {
      isHome,
      isAuthenticated,
      showBottomNav,
      showMarketingFooter,
      headerVariant: isHome && !isAuthenticated ? "marketing" : "app",
      mainBottomPadding: showBottomNav
        ? "calc(4.5rem + env(safe-area-inset-bottom, 0px))"
        : "env(safe-area-inset-bottom, 0px)",
    };
  }, [pathname, isAuthenticated]);
}
