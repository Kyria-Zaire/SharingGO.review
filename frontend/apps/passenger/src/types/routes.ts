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
  profileEdit: "/profile/edit",
  notifications: "/notifications",
  settings: "/settings",
  tripDetail: (tripId: string) => `/trips/${encodeURIComponent(tripId)}`,
  tripBooking: (tripId: string) => `/trips/${encodeURIComponent(tripId)}/book`,
  pendingBooking: (pendingReservationId: string) =>
    `/bookings/pending/${encodeURIComponent(pendingReservationId)}`,
  paymentSuccess: "/bookings/payment/success",
  paymentCancel: "/bookings/payment/cancel",
  subscriptions: "/subscriptions",
  help: "/help",
  legalTerms: "/legal/terms",
  legalPrivacy: "/legal/privacy",
  legalNotice: "/legal/notice",
  contact: "/contact",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
