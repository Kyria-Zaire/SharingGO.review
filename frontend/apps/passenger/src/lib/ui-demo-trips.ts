/** Mode trajets démo UI — jamais actif en production (WEB-DEMO-DATA-01).
 *
 * ⚠️ AVANT PROD / PRÉPROD / PILOT-01 :
 * - Retirer `VITE_ENABLE_UI_DEMO_TRIPS` du `.env` local et de tout déploiement
 * - Vérifier badge absent + aucun `demo-trip-*` en liste
 * - Vérifier badge absent + aucun `demo-booking-*` sur /bookings
 * - Voir checklist complète : docs/features/WEB-DEMO-DATA-01.md § « AVANT DEPLOY-01 »
 */

export const DEMO_TRIP_ID_PREFIX = "demo-trip-";
export const DEMO_BOOKING_ID_PREFIX = "demo-booking-";

export function isDemoTripId(tripId: string): boolean {
  return tripId.startsWith(DEMO_TRIP_ID_PREFIX);
}

export function isDemoBookingId(reservationId: string): boolean {
  return reservationId.startsWith(DEMO_BOOKING_ID_PREFIX);
}

/** Flag lu uniquement hors build production. */
export function isUiDemoTripsEnabled(): boolean {
  if (import.meta.env.PROD) {
    return false;
  }
  return import.meta.env.VITE_ENABLE_UI_DEMO_TRIPS === "true";
}

export function shouldShowUiDemoBadge(): boolean {
  return isUiDemoTripsEnabled();
}
