export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  trips: "/trips",
  bookings: "/bookings",
  boardingPass: "/boarding-pass",
  profile: "/profile",
  tripDetail: (tripId: string) => `/trips/${encodeURIComponent(tripId)}`,
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export interface BottomNavItem {
  label: string;
  href: string;
  end?: boolean;
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { label: "Accueil", href: ROUTES.home, end: true },
  { label: "Trajets", href: ROUTES.trips },
  { label: "Réservations", href: ROUTES.bookings },
  { label: "Profil", href: ROUTES.profile },
];
