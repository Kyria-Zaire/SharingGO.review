export const ROUTES = {
  login: "/login",
  dashboard: "/",
  trips: "/trips",
  reservations: "/reservations",
  payments: "/payments",
  subscriptions: "/subscriptions",
  boarding: "/boarding",
  monitoring: "/monitoring",
  departures: "/departures",
  incidents: "/incidents",
  activity: "/activity",
  settings: "/settings",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
