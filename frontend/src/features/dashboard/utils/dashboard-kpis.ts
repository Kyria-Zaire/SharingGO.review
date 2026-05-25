import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import { isTodayIso } from "@/features/dashboard/utils/dashboard-date";
import type { AdminIncident } from "@/types/incidents.types";
import type { AdminPayment } from "@/types/payments.types";
import type { DepartureTripView } from "@/types/departures.types";

export interface DashboardKpiSnapshot {
  successfulPaymentsToday: number;
  processedPayments: number;
  subscriptionPaymentsActive: number;
  occupiedSeats: number;
  tripsInBoarding: number;
  openIncidents: number;
}

export function computeDashboardKpis(input: {
  payments: AdminPayment[];
  departures: DepartureTripView[];
  incidents: AdminIncident[];
}): DashboardKpiSnapshot {
  const succeeded = input.payments.filter((payment) => payment.status === "SUCCEEDED");
  const successfulPaymentsToday = succeeded.filter((payment) =>
    isTodayIso(payment.createdAt)
  ).length;

  const processedPayments = succeeded.length;

  const subscriptionPaymentsActive = succeeded.filter(
    (payment) =>
      payment.type === "SUBSCRIPTION" || payment.type === "SUBSCRIPTION_ACCESS"
  ).length;

  const occupiedSeats = input.departures.reduce(
    (sum, departure) => sum + departure.occupiedSeats,
    0
  );

  const tripsInBoarding = input.departures.filter(
    (departure) => departure.readiness === "BOARDING_IN_PROGRESS"
  ).length;

  const openIncidents = input.incidents.filter((incident) =>
    isOpenIncidentStatus(incident.status)
  ).length;

  return {
    successfulPaymentsToday,
    processedPayments,
    subscriptionPaymentsActive,
    occupiedSeats,
    tripsInBoarding,
    openIncidents,
  };
}
