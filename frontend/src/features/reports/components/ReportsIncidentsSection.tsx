import { Link } from "react-router-dom";
import { IncidentSeverityBadge } from "@/features/incidents/components/IncidentSeverityBadge";
import {
  getIncidentTypeLabel,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPE_LABELS,
} from "@/features/incidents/constants/incident-labels";
import { formatDate } from "@/lib/format-date";
import { ROUTES } from "@/constants/routes";
import type {
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from "@/types/incidents.types";
import type { OperationsIncidentReportItem } from "@/types/reports.types";

interface ReportsIncidentsFiltersProps {
  status?: IncidentStatus;
  type?: IncidentType;
  severity?: IncidentSeverity;
  onStatusChange: (status: IncidentStatus | undefined) => void;
  onTypeChange: (type: IncidentType | undefined) => void;
  onSeverityChange: (severity: IncidentSeverity | undefined) => void;
}

export function ReportsIncidentsFilters({
  status,
  type,
  severity,
  onStatusChange,
  onTypeChange,
  onSeverityChange,
}: ReportsIncidentsFiltersProps) {
  return (
    <div className="mb-3 grid gap-3 sm:grid-cols-3">
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Statut</span>
        <select
          value={status ?? ""}
          onChange={(e) =>
            onStatusChange(e.target.value ? (e.target.value as IncidentStatus) : undefined)
          }
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Tous</option>
          {(Object.keys(INCIDENT_STATUS_LABELS) as IncidentStatus[]).map((value) => (
            <option key={value} value={value}>
              {INCIDENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Type</span>
        <select
          value={type ?? ""}
          onChange={(e) =>
            onTypeChange(e.target.value ? (e.target.value as IncidentType) : undefined)
          }
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Tous</option>
          {(Object.keys(INCIDENT_TYPE_LABELS) as IncidentType[]).map((value) => (
            <option key={value} value={value}>
              {getIncidentTypeLabel(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">Sévérité</span>
        <select
          value={severity ?? ""}
          onChange={(e) =>
            onSeverityChange(
              e.target.value ? (e.target.value as IncidentSeverity) : undefined
            )
          }
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">Toutes</option>
          {(Object.keys(INCIDENT_SEVERITY_LABELS) as IncidentSeverity[]).map((value) => (
            <option key={value} value={value}>
              {INCIDENT_SEVERITY_LABELS[value]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

interface ReportsIncidentsTableProps {
  rows: OperationsIncidentReportItem[];
}

export function ReportsIncidentsTable({ rows }: ReportsIncidentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Sévérité</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Trajet</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="bg-background hover:bg-muted/20">
              <td className="px-4 py-3 font-medium text-foreground">{row.code}</td>
              <td className="px-4 py-3 text-foreground">{getIncidentTypeLabel(row.type)}</td>
              <td className="px-4 py-3">
                <IncidentSeverityBadge severity={row.severity} status={row.status} />
              </td>
              <td className="px-4 py-3 text-foreground">
                {INCIDENT_STATUS_LABELS[row.status] ?? row.status}
              </td>
              <td className="px-4 py-3 text-foreground">
                {row.relatedTripId ? (
                  <Link
                    to={`${ROUTES.exploitationHistory}/${row.relatedTripId}`}
                    className="text-primary hover:underline"
                  >
                    {row.relatedTripId.slice(0, 8)}…
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDate(row.occurredAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
