import type { BookingsFilter } from "@/hooks/useUserReservations";

export const BOOKINGS_HERO_CONTENT = {
  titleBefore: "Mes ",
  titleHighlight: "réservations",
  subtitleBefore: "Retrouvez vos billets, consultez le statut de vos trajets et accédez à votre ",
  subtitleBold: "QR d'embarquement",
  subtitleAfter: " en quelques secondes.",
} as const;

export const BOOKINGS_FILTER_LABELS: Record<BookingsFilter, string> = {
  upcoming: "À venir",
  past: "Passées",
  canceled: "Annulées",
};
