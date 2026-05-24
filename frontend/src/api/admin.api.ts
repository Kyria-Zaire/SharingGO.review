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
import { http } from "./http";

export const adminApi = {
  health: () => http<{ status: string }>("/health"),
} as const;
