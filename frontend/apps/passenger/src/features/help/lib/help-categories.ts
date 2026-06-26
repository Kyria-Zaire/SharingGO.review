export type HelpCategory =
  | "bookings"
  | "trips"
  | "subscriptions"
  | "payments"
  | "account"
  | "notifications"
  | "settings";

export const HELP_CATEGORIES: HelpCategory[] = [
  "bookings",
  "trips",
  "subscriptions",
  "payments",
  "account",
  "notifications",
  "settings",
];

export type HelpCategoryFilter = HelpCategory | "all";
