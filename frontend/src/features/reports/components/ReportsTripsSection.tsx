import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { TripLifecycleBadge } from "@/features/departures/components/TripLifecycleBadge";
import { formatCurrency } from "@/features/reports/utils/reports-period";
import { formatDate } from "@/lib/format-date";
import { ROUTES } from "@/constants/routes";
import type { TripLifecycleStatus } from "@/types/trips.types";
import type { OperationsTripReportRow } from "@/types/reports.types";

interface ReportsTripsFiltersProps {
  lifecycleStatus?: TripLifecycleStatus;
  onLifecycleChange: (status: TripLifecycleStatus | undefined) => void;
}

const LIFECYCLE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "WAITING", label: "WAITING" },
  { value: "BOARDING", label: "BOARDING" },
  { value: "DEPARTED", label: "DEPARTED" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

export function ReportsTripsFilters({
  lifecycleStatus,
  onLifecycleChange,
}: ReportsTripsFiltersProps) {
  return (
    <label className="mb-3 block max-w-xs space-y-1">
      <span className="text-xs font-medium text-muted-foreground">Lifecycle</span>
      <select
        value={lifecycleStatus ?? ""}
        onChange={(e) =>
          onLifecycleChange(
            e.target.value ? (e.target.value as TripLifecycleStatus) : undefined
          )
        }
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {LIFECYCLE_OPTIONS.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface ReportsTripsTableProps {
  rows: OperationsTripReportRow[];
}

export function ReportsTripsTable({ rows }: ReportsTripsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Ligne</th>
            <th className="px-4 py-3 font-medium">Lifecycle</th>
            <th className="px-4 py-3 font-medium">Occupés</th>
            <th className="px-4 py-3 font-medium">Embarqués</th>
            <th className="px-4 py-3 font-medium">No-show</th>
            <th className="px-4 py-3 font-medium">Incidents</th>
            <th className="px-4 py-3 font-medium">Recette</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.tripId} className="bg-background hover:bg-muted/20">
              <td className="px-4 py-3 whitespace-nowrap text-foreground">
                {formatDate(row.departureTime)}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">{row.routeLabel}</p>
                <p className="text-xs text-muted-foreground">{row.tripId}</p>
              </td>
              <td className="px-4 py-3">
                <TripLifecycleBadge status={row.lifecycleStatus} />
              </td>
              <td className="px-4 py-3 tabular-nums text-foreground">{row.occupiedSeats}</td>
              <td className="px-4 py-3 tabular-nums text-foreground">{row.usedSeats}</td>
              <td className="px-4 py-3 tabular-nums text-foreground">{row.noShowEstimated}</td>
              <td className="px-4 py-3 tabular-nums text-foreground">{row.incidentCount}</td>
              <td className="px-4 py-3 tabular-nums text-foreground">
                {formatCurrency(row.revenueAmount)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link to={`${ROUTES.exploitationHistory}/${row.tripId}`}>
                  <Button type="button" variant="secondary" size="sm">
                    Historique
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
