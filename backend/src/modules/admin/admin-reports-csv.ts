import type {
  OperationsIncidentReportItem,
  OperationsOverviewResponse,
  OperationsTripReportRow,
} from "./admin-reports.types.js";

const UTF8_BOM = "\uFEFF";
const CSV_SEPARATOR = ";";

function escapeCsvCell(value: string): string {
  if (value.includes(CSV_SEPARATOR) || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvLine(cells: string[]): string {
  return cells.map(escapeCsvCell).join(CSV_SEPARATOR);
}

export function buildCsv(lines: string[][]): string {
  return UTF8_BOM + lines.map(toCsvLine).join("\r\n");
}

export function buildTripsCsv(rows: OperationsTripReportRow[]): string {
  const header = [
    "Trip",
    "Date",
    "Lifecycle",
    "Occupés",
    "Embarqués",
    "No-show",
    "Incidents",
    "Recette",
  ];
  const data = rows.map((row) => [
    row.tripId,
    row.departureTime,
    row.lifecycleStatus,
    String(row.occupiedSeats),
    String(row.usedSeats),
    String(row.noShowEstimated),
    String(row.incidentCount),
    row.revenueAmount,
  ]);
  return buildCsv([header, ...data]);
}

export function buildIncidentsCsv(incidents: OperationsIncidentReportItem[]): string {
  const header = [
    "Code",
    "Type",
    "Gravité",
    "Statut",
    "Source",
    "Trip lié",
    "Survenu le",
    "Résolu le",
    "Titre",
  ];
  const data = incidents.map((incident) => [
    incident.code,
    incident.type,
    incident.severity,
    incident.status,
    incident.source,
    incident.relatedTripId ?? "",
    incident.occurredAt,
    incident.resolvedAt ?? "",
    incident.title,
  ]);
  return buildCsv([header, ...data]);
}

export function buildPaymentsCsv(
  payments: Array<{
    id: string;
    createdAt: Date;
    amount: { toFixed(n: number): string };
    currency: string;
    status: string;
    type: string;
    userId: string;
    reservationId: string | null;
  }>
): string {
  const header = [
    "ID",
    "Date",
    "Montant",
    "Devise",
    "Statut",
    "Type",
    "User ID",
    "Réservation ID",
  ];
  const data = payments.map((payment) => [
    payment.id,
    payment.createdAt.toISOString(),
    payment.amount.toFixed(2),
    payment.currency,
    payment.status,
    payment.type,
    payment.userId,
    payment.reservationId ?? "",
  ]);
  return buildCsv([header, ...data]);
}

export function buildSummaryCsv(overview: OperationsOverviewResponse): string {
  const rows: string[][] = [
    ["Indicateur", "Valeur"],
    ["Période début", overview.period.from],
    ["Période fin", overview.period.to],
    ["Trajets total", String(overview.totalTrips)],
    ["Trajets terminés", String(overview.completedTrips)],
    ["Trajets annulés", String(overview.cancelledTrips)],
    ["Réservations total", String(overview.totalReservations)],
    ["Réservations embarquées", String(overview.usedReservations)],
    ["Taux embarquement (%)", String(overview.boardingRate)],
    ["Taux remplissage (%)", String(overview.occupancyRate)],
    ["Recettes total", overview.totalRevenue],
    ["Devise", overview.currency],
    ["Incidents total", String(overview.totalIncidents)],
    ["Incidents critiques", String(overview.criticalIncidents)],
    ["Généré le", overview.meta.generatedAt],
  ];
  return buildCsv(rows);
}

export function exportFilename(reportKey: string, from: string, to: string): string {
  const fromDay = from.slice(0, 10);
  const toDay = to.slice(0, 10);
  return `${reportKey}-${fromDay}_${toDay}.csv`;
}
