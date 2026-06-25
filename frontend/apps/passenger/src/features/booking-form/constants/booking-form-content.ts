/** Copy page formulaire réservation — WEB-BOOKING-FORM-01. */

export const BOOKING_FORM_BACK_LABEL = "Retour au trajet";

export const BOOKING_FORM_TITLE = "Réserver ma place";

export const BOOKING_FORM_STEPS = [
  { id: "info", label: "Informations" },
  { id: "payment", label: "Paiement" },
  { id: "confirmation", label: "Confirmation" },
  { id: "ticket", label: "Billet" },
] as const;

export const BOOKING_FORM_ACTIVE_STEP = "info" as const;

export const BOOKING_FORM_PASSENGER_SECTION_TITLE = "Informations passager";

export const BOOKING_FORM_OPTIONS_SECTION_TITLE = "Options de voyage";

export const BOOKING_FORM_LUGGAGE_OPTION = "1 bagage cabine inclus";

export const BOOKING_FORM_SEATS_LABEL = "Nombre de places";

export const BOOKING_FORM_SEATS_VALUE = "1 place";

export const BOOKING_FORM_TERMS_PREFIX = "J'accepte les ";

export const BOOKING_FORM_TERMS_CGV = "Conditions Générales de Vente";

export const BOOKING_FORM_TERMS_AND = " et la ";

export const BOOKING_FORM_TERMS_PRIVACY = "Politique de confidentialité";

export const BOOKING_FORM_TERMS_SUFFIX = ".";

export const BOOKING_FORM_SUBMIT_CTA = "Continuer vers le paiement";

export const BOOKING_FORM_SUBMIT_LOADING = "Réservation en cours…";

export const BOOKING_FORM_SUMMARY_TITLE = "Récapitulatif";

export const BOOKING_FORM_PRICE_LABEL = "Prix";

export const BOOKING_FORM_SERVICE_FEE_LABEL = "Frais de service";

export const BOOKING_FORM_SERVICE_FEE_VALUE = "0,00 €";

export const BOOKING_FORM_TOTAL_LABEL = "Total";

export const BOOKING_FORM_SECURE_PAYMENT = "Paiement sécurisé";

export const BOOKING_FORM_REASSURANCE = [
  "Paiement sécurisé",
  "Données protégées",
  "Support réactif",
] as const;

export const BOOKING_FORM_SUPPORT_TITLE = "Besoin d'aide ?";

export const BOOKING_FORM_SUPPORT_EMAIL = "support@sharinggo.fr";

export const BOOKING_FORM_SUPPORT_PHONE = "07 80 90 10 20";

export const BOOKING_FORM_SUPPORT_CTA = "Nous contacter";

export const BOOKING_FORM_UNAVAILABLE_TITLE = "Trajet indisponible";

export const BOOKING_FORM_UNAVAILABLE_MESSAGE =
  "Ce trajet n'est plus réservable. Consultez les autres départs disponibles.";

export const BOOKING_FORM_DEMO_MESSAGE =
  "La réservation n'est pas disponible pour les trajets démo UI.";

export const BOOKING_FORM_PHONE_LABEL = "Téléphone optionnel";

export const BOOKING_FORM_PHONE_PLACEHOLDER = "06 12 34 56 78";
