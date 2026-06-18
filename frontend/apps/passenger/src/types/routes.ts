export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  trips: "/trips",
  bookings: "/bookings",
  bookingDetail: (reservationId: string) =>
    `/bookings/${encodeURIComponent(reservationId)}`,
  boardingPass: (reservationId: string) =>
    `/bookings/${encodeURIComponent(reservationId)}/boarding-pass`,
  profile: "/profile",
  tripDetail: (tripId: string) => `/trips/${encodeURIComponent(tripId)}`,
  pendingBooking: (pendingReservationId: string) =>
    `/bookings/pending/${encodeURIComponent(pendingReservationId)}`,
  paymentSuccess: "/bookings/payment/success",
  paymentCancel: "/bookings/payment/cancel",
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
