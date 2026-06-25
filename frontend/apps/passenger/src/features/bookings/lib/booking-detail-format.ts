import { formatDate } from "@/lib/format-date";
import type { PassengerUser } from "@/types/auth";

export function formatBookingReservedAt(createdAt: string): string {
  const formatted = formatDate(createdAt, "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Réservée le ${formatted}`;
}

export function formatPassengerFullName(user: PassengerUser | null | undefined): string {
  if (!user) return "—";
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : user.email;
}

export function formatPassengerPhone(): string {
  return "—";
}
