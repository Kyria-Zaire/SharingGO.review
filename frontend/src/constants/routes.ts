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
  exploitationHistory: "/history",
  reports: "/reports",
  activity: "/activity",
  dispatch: "/dispatch",
  settings: "/settings",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
