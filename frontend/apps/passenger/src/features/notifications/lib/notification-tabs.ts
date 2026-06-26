import type { NotificationCategory } from "@/features/notifications/types/notifications.types";

export type NotificationTab = "all" | NotificationCategory;

export const NOTIFICATION_TABS: NotificationTab[] = [
  "all",
  "trip",
  "booking",
  "payment",
  "system",
];

export type NotificationReadFilter = "all" | "unread" | "read";

export const NOTIFICATION_READ_FILTERS: NotificationReadFilter[] = ["all", "unread", "read"];
