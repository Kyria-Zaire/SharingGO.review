import { formatTime } from "@/lib/format-date";
import type { NotificationItem } from "@/features/notifications/types/notifications.types";

export function formatNotificationTime(iso: string): string {
  return formatTime(iso);
}

export function formatNotificationDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const isToday =
    date.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) ===
    now.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });

  if (isToday) {
    return formatTime(iso);
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}

export function countUnread(notifications: NotificationItem[]): number {
  return notifications.filter((item) => !item.read).length;
}
