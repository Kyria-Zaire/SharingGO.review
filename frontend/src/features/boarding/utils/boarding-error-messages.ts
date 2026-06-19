export interface BoardingErrorMessage {
  title: string;
  description: string;
}

/** Message terrain — second scan après embarquement (USED → RESERVATION_NOT_CONFIRMED côté API). */
const PASSENGER_ALREADY_EMBARKED: BoardingErrorMessage = {
  title: "Passager déjà embarqué",
  description:
    "Ce passager a déjà été enregistré pour ce trajet. Aucune action supplémentaire n'est nécessaire.",
};

/** Codes backend + alias UX (INVALID_BOARDING_TOKEN) + erreurs client (NETWORK_ERROR). */
const BOARDING_ERROR_MESSAGES: Record<string, BoardingErrorMessage> = {
  BOARDING_ALREADY_USED: PASSENGER_ALREADY_EMBARKED,
  RESERVATION_NOT_CONFIRMED: PASSENGER_ALREADY_EMBARKED,
  BOARDING_WINDOW_EXPIRED: {
    title: "Billet expiré",
    description:
      "La fenêtre d'embarquement est terminée (départ + 10 min). Demandez au passager de rafraîchir son billet.",
  },
  EXPIRED_TOKEN: {
    title: "Billet expiré",
    description:
      "Le QR code a expiré. Demandez au passager d'actualiser son billet sur l'application.",
  },
  INVALID_TOKEN: {
    title: "QR invalide",
    description:
      "Ce QR code n'est pas reconnu. Vérifiez le billet ou utilisez la saisie manuelle.",
  },
  INVALID_BOARDING_TOKEN: {
    title: "QR invalide",
    description:
      "Ce QR code n'est pas reconnu. Vérifiez le billet ou utilisez la saisie manuelle.",
  },
  INVALID_TYPE: {
    title: "QR invalide",
    description: "Le format du billet scanné n'est pas reconnu.",
  },
  INVALID_PAYLOAD: {
    title: "QR invalide",
    description: "Les données du billet scanné sont illisibles ou incomplètes.",
  },
  NETWORK_ERROR: {
    title: "Connexion indisponible",
    description:
      "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez dans un instant.",
  },
  RESERVATION_NOT_FOUND: {
    title: "Billet introuvable",
    description: "Aucune réservation ne correspond à ce QR code.",
  },
  TOKEN_REVOKED: {
    title: "Billet révoqué",
    description:
      "Ce billet n'est plus valide. Demandez au passager d'actualiser son billet sur l'application.",
  },
  TRIP_DISABLED: {
    title: "Trajet indisponible",
    description: "Le trajet associé à ce billet n'est plus actif.",
  },
  PAYMENT_NOT_SUCCEEDED: {
    title: "Paiement non validé",
    description: "Le paiement de cette réservation n'a pas été confirmé.",
  },
  INTERNAL_VALIDATION_ERROR: {
    title: "Erreur de vérification",
    description: "Un problème technique est survenu lors du contrôle. Réessayez ou contactez le support.",
  },
  INTERNAL_CONSUMPTION_ERROR: {
    title: "Erreur d'enregistrement",
    description: "L'embarquement n'a pas pu être enregistré. Réessayez dans un instant.",
  },
};

const FALLBACK_MESSAGE: BoardingErrorMessage = {
  title: "Billet refusé",
  description: "Ce billet ne peut pas être accepté pour l'embarquement.",
};

function normalizeBoardingErrorCode(code: string): string {
  if (code === "INVALID_BOARDING_TOKEN") return "INVALID_TOKEN";
  return code;
}

export function resolveBoardingErrorMessage(code: string | undefined): BoardingErrorMessage {
  if (!code) return FALLBACK_MESSAGE;
  const normalized = normalizeBoardingErrorCode(code.trim());
  return BOARDING_ERROR_MESSAGES[normalized] ?? FALLBACK_MESSAGE;
}

/** Code technique visible uniquement hors build production (dev / preview local). */
export function boardingErrorDevCode(code: string | undefined): string | null {
  if (import.meta.env.PROD || !code?.trim()) return null;
  return code.trim();
}
