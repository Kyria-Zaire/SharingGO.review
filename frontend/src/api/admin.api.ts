/**
 * Admin API surface — re-exports by domain.
 */
export {
  disableAdminTrip,
  enableAdminTrip,
  getAdminTripOccupancy,
  listAdminLines,
  listAdminTrips,
} from "./admin-trips.api";
export { getAdminReservation, listAdminReservations } from "./admin-reservations.api";
export { listAdminPayments } from "./admin-payments.api";
export {
  consumeBoarding,
  getBoardingOfflineCapabilities,
  validateBoarding,
} from "./admin-boarding.api";
export { fetchMonitoringSnapshot } from "./system.api";
