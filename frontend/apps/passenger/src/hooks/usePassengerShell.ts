import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

export interface PassengerShellState {
  isHome: boolean;
  isTripsDiscovery: boolean;
  isTripDetail: boolean;
  isBookingsList: boolean;
  isSubscriptionsList: boolean;
  isProfilePage: boolean;
  isNotificationsPage: boolean;
  isSettingsPage: boolean;
  isHelpPage: boolean;
  isLegalPage: boolean;
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
    const isTripDetail =
      pathname.startsWith(`${ROUTES.trips}/`) && pathname !== ROUTES.trips;
    const isBookingsList = pathname === ROUTES.bookings;
    const isSubscriptionsList = pathname === ROUTES.subscriptions;
    const isProfilePage =
      pathname === ROUTES.profile || pathname === ROUTES.profileEdit;
    const isNotificationsPage = pathname === ROUTES.notifications;
    const isSettingsPage = pathname === ROUTES.settings;
    const isHelpPage = pathname === ROUTES.help;
    const isLegalPage =
      pathname === ROUTES.legalTerms ||
      pathname === ROUTES.legalPrivacy ||
      pathname === ROUTES.legalNotice ||
      pathname === ROUTES.contact;
    const isMarketingSurface =
      isHome ||
      isTripsDiscovery ||
      isTripDetail ||
      isBookingsList ||
      isSubscriptionsList ||
      isProfilePage ||
      isNotificationsPage ||
      isSettingsPage ||
      isHelpPage ||
      isLegalPage;

    return {
      isHome,
      isTripsDiscovery,
      isTripDetail,
      isBookingsList,
      isSubscriptionsList,
      isProfilePage,
      isNotificationsPage,
      isSettingsPage,
      isHelpPage,
      isLegalPage,
      isMarketingSurface,
      isAuthenticated,
      showMarketingFooter: isMarketingSurface,
      headerVariant: isHome && !isAuthenticated ? "marketing" : "app",
      mainBottomPadding: "env(safe-area-inset-bottom, 0px)",
    };
  }, [pathname, isAuthenticated]);
}
