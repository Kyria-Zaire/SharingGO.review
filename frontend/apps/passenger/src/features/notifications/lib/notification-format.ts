import { formatTime } from "@/lib/format-date";

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
