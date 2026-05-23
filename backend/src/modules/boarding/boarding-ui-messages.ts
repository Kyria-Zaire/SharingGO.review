import { BOARDING_CONSUMPTION_REASONS, type BoardingConsumptionReason } from "./boarding-consumption-reasons.js";
import { BOARDING_UI_STATUS, type BoardingUiMessage } from "./boarding-ui.types.js";

const CONSUME_SUCCESS_UI: BoardingUiMessage = {
  status: BOARDING_UI_STATUS.SUCCESS,
  title: "Billet valide",
  message: "Passager embarqué",
};

const CONSUME_ALREADY_USED_UI: BoardingUiMessage = {
  status: BOARDING_UI_STATUS.WARNING,
  title: "Billet déjà utilisé",
  message: "Ce billet a déjà été scanné",
};

const REASON_UI_MAP: Record<BoardingConsumptionReason, BoardingUiMessage> = {
  [BOARDING_CONSUMPTION_REASONS.BOARDING_ALREADY_USED]: CONSUME_ALREADY_USED_UI,
  [BOARDING_CONSUMPTION_REASONS.INVALID_TOKEN]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "QR invalide",
    message: "Le billet est invalide",
  },
  [BOARDING_CONSUMPTION_REASONS.EXPIRED_TOKEN]: {
    status: BOARDING_UI_STATUS.WARNING,
    title: "Billet expiré",
    message: "La fenêtre d'embarquement est dépassée",
  },
  [BOARDING_CONSUMPTION_REASONS.INVALID_TYPE]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "QR invalide",
    message: "Type de billet non reconnu",
  },
  [BOARDING_CONSUMPTION_REASONS.INVALID_PAYLOAD]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "QR invalide",
    message: "Données du billet incomplètes",
  },
  [BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_FOUND]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Réservation introuvable",
    message: "Aucune réservation ne correspond à ce billet",
  },
  [BOARDING_CONSUMPTION_REASONS.TOKEN_REVOKED]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Billet révoqué",
    message: "Ce billet n'est plus valide",
  },
  [BOARDING_CONSUMPTION_REASONS.RESERVATION_NOT_CONFIRMED]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Réservation non confirmée",
    message: "Le billet n'est pas confirmé",
  },
  [BOARDING_CONSUMPTION_REASONS.TRIP_DISABLED]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Trajet indisponible",
    message: "Ce trajet n'est plus actif",
  },
  [BOARDING_CONSUMPTION_REASONS.BOARDING_WINDOW_EXPIRED]: {
    status: BOARDING_UI_STATUS.WARNING,
    title: "Fenêtre expirée",
    message: "L'embarquement n'est plus possible pour ce trajet",
  },
  [BOARDING_CONSUMPTION_REASONS.PAYMENT_NOT_SUCCEEDED]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Paiement invalide",
    message: "Le paiement de ce billet n'est pas validé",
  },
  [BOARDING_CONSUMPTION_REASONS.INTERNAL_CONSUMPTION_ERROR]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Erreur technique",
    message: "Impossible de valider le billet pour le moment",
  },
  [BOARDING_CONSUMPTION_REASONS.INTERNAL_VALIDATION_ERROR]: {
    status: BOARDING_UI_STATUS.ERROR,
    title: "Erreur technique",
    message: "Impossible de valider le billet pour le moment",
  },
};

export function getConsumeSuccessUi(): BoardingUiMessage {
  return CONSUME_SUCCESS_UI;
}

export function getConsumeAlreadyUsedUi(): BoardingUiMessage {
  return CONSUME_ALREADY_USED_UI;
}

export function getConsumeFailureUi(reason: BoardingConsumptionReason): BoardingUiMessage {
  return REASON_UI_MAP[reason] ?? REASON_UI_MAP[BOARDING_CONSUMPTION_REASONS.INTERNAL_CONSUMPTION_ERROR];
}
