export const ROUTES = {
  login: "/login",
  dashboard: "/",
  trips: "/trips",
  reservations: "/reservations",
  payments: "/payments",
  subscriptions: "/subscriptions",
  boarding: "/boarding",
  settings: "/settings",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
