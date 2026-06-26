import { ApiError } from "@/api/http";

/** Messages utilisateur — ne jamais exposer jargon technique (API, Stripe, CORS, etc.). */
export const USER_MESSAGES = {
  network:
    "Connexion impossible. Vérifiez votre réseau et réessayez dans quelques instants.",
  generic: "Une erreur est survenue. Veuillez réessayer.",
  requestFailed: "La requête a échoué. Veuillez réessayer.",
  tripsLoad: "Impossible de charger les trajets.",
  reservationsLoad: "Impossible de charger vos réservations.",
  reservationLoad: "Impossible de charger cette réservation.",
  tripLoad: "Impossible de charger ce trajet.",
  tripNotFound: "Trajet introuvable.",
  reservationNotFound: "Réservation introuvable ou inaccessible.",
  tripIdMissing: "Trajet introuvable.",
  reservationIdMissing: "Réservation introuvable.",
  boardingLoad: "Impossible de charger votre billet d'embarquement.",
  subscriptionsLoad: "Impossible de charger vos abonnements.",
  pendingLoad: "Impossible de charger votre réservation temporaire.",
  releasePlace: "Impossible de libérer votre place. Veuillez réessayer.",
  paymentConfirm: "Le paiement n'a pas pu être confirmé. Consultez vos réservations.",
} as const;

const ENGLISH_TECHNICAL_PATTERNS =
  /request failed|internal error|server error|stripe|checkout failed|error fetching|failed to load|not found|unauthorized|forbidden/i;

/** Message API backend déjà rédigé pour l'utilisateur (français). */
function isFrenchUserMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (ENGLISH_TECHNICAL_PATTERNS.test(trimmed) && !/[àâéèêëïîôùûüç]/i.test(trimmed)) {
    return false;
  }
  return /[àâéèêëïîôùûüç]/i.test(trimmed) || /^impossible\b/i.test(trimmed);
}

export function formatUserFacingError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0 || error.code === "NETWORK_ERROR") {
      return USER_MESSAGES.network;
    }
    if (error.code === "TRIP_NOT_FOUND") {
      return USER_MESSAGES.tripNotFound;
    }
    if (error.code === "RESERVATION_NOT_FOUND") {
      return USER_MESSAGES.reservationNotFound;
    }
    if (isFrenchUserMessage(error.message)) {
      return error.message;
    }
    return fallback;
  }
  if (error instanceof TypeError) {
    return USER_MESSAGES.network;
  }
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("fetch")) {
      return USER_MESSAGES.network;
    }
    if (isFrenchUserMessage(error.message)) {
      return error.message;
    }
  }
  return fallback;
}
