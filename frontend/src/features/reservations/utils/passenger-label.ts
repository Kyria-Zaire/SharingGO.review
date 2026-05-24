import type { AdminUserMinimal } from "@/types/reservations.types";

export function formatPassengerLabel(user: AdminUserMinimal): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.email) return user.email;
  return "Utilisateur inconnu";
}
