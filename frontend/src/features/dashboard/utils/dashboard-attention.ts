import { ROUTES } from "@/constants/routes";
import { isCriticalOpen } from "@/features/incidents/constants/incident-labels";
import type { AdminIncident } from "@/types/incidents.types";
import type { DepartureTripView } from "@/types/departures.types";
import type { MonitoringSnapshot } from "@/types/system.types";

export type AttentionTone = "critical" | "warning";

export interface DashboardAttentionItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: AttentionTone;
}

function hasMonitoringWarnings(snapshot: MonitoringSnapshot | undefined): string[] {
  if (!snapshot) return [];
  const warnings: string[] = [];
  if (snapshot.health.status !== "ok") {
    warnings.push(`API health: ${snapshot.health.status.toUpperCase()}`);
  }
  if (snapshot.readiness.status !== "ok") {
    warnings.push(`Readiness: ${snapshot.readiness.data?.status ?? snapshot.readiness.status}`);
  }
  const stripe = snapshot.readiness.data?.checks.stripe?.status;
  if (stripe === "error") warnings.push("Stripe configuration check failed");
  const database = snapshot.readiness.data?.checks.database?.status;
  if (database === "error") warnings.push("Database check failed");
  return warnings;
}

export function buildAttentionItems(input: {
  incidents: AdminIncident[];
  departures: DepartureTripView[];
  monitoring?: MonitoringSnapshot;
}): DashboardAttentionItem[] {
  const items: DashboardAttentionItem[] = [];

  for (const incident of input.incidents) {
    if (!isCriticalOpen(incident)) continue;
    items.push({
      id: `incident-${incident.id}`,
      title: incident.title,
      detail: `${incident.code} · critique ouvert`,
      href: ROUTES.incidents,
      tone: "critical",
    });
  }

  for (const warning of hasMonitoringWarnings(input.monitoring)) {
    items.push({
      id: `monitoring-${warning}`,
      title: "Monitoring — action requise",
      detail: warning,
      href: ROUTES.monitoring,
      tone: warning.includes("failed") || warning.includes("not_ready") ? "critical" : "warning",
    });
  }

  for (const departure of input.departures) {
    if (!departure.nearDeparture) continue;

    const noBoarding =
      departure.boardedCount === 0 &&
      !departure.boardingComplete &&
      departure.occupiedSeats > 0;

    if (noBoarding) {
      items.push({
        id: `no-boarding-${departure.tripId}`,
        title: "Aucune activité boarding",
        detail: `${departure.routeLabel} · départ imminent · ${departure.occupiedSeats} siège(s) réservé(s)`,
        href: ROUTES.boarding,
        tone: "critical",
      });
      continue;
    }

    const hasCriticalIncident = departure.incidents.some((i) => i.severity === "critical");
    const lowBoarding =
      departure.percentBoarded < 50 && departure.occupiedSeats > 0 && !departure.boardingComplete;

    if (hasCriticalIncident || lowBoarding) {
      items.push({
        id: `departure-${departure.tripId}`,
        title: "Départ imminent — situation dégradée",
        detail: `${departure.routeLabel} · ${departure.percentBoarded}% embarqués`,
        href: ROUTES.departures,
        tone: hasCriticalIncident ? "critical" : "warning",
      });
    }
  }

  const toneRank: Record<AttentionTone, number> = { critical: 0, warning: 1 };
  return items.sort((a, b) => toneRank[a.tone] - toneRank[b.tone]);
}

export function countMonitoringWarnings(snapshot: MonitoringSnapshot | undefined): number {
  return hasMonitoringWarnings(snapshot).length;
}
