import type { BoardingApiErrorCode } from "@/types/boarding";
import { ROUTES } from "@/types/routes";

export function getBoardingErrorView(
  code: BoardingApiErrorCode | string,
  detailPath: string
): {
  title: string;
  message: string;
  backLabel: string;
  backTo: string;
} | null {
  switch (code) {
    case "RESERVATION_NOT_FOUND":
      return {
        title: "Billet introuvable",
        message: "Cette réservation n'existe pas ou ne vous appartient pas.",
        backLabel: "← Retour à mes réservations",
        backTo: ROUTES.bookings,
      };
    case "RESERVATION_NOT_CONFIRMED":
      return {
        title: "Billet non confirmé",
        message: "Ce billet n'est pas confirmé et ne peut pas être présenté.",
        backLabel: "← Retour à ma réservation",
        backTo: detailPath,
      };
    case "BOARDING_NOT_AVAILABLE":
      return {
        title: "Billet pas encore disponible",
        message: "Le QR d'embarquement sera disponible une fois le paiement validé.",
        backLabel: "← Retour à ma réservation",
        backTo: detailPath,
      };
    case "BOARDING_EXPIRED":
      return {
        title: "Billet expiré",
        message: "La fenêtre d'embarquement est terminée (départ + 10 minutes).",
        backLabel: "← Retour à ma réservation",
        backTo: detailPath,
      };
    default:
      return null;
  }
}
