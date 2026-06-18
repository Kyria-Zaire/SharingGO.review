import { ArrowLeftRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TRIPS_ROUTE_LABEL } from "@/constants/pricing";
import type { PublicLine } from "@/types/trips.types";

export function TripsRouteSummary({ line }: { line?: PublicLine }) {
  const routeLabel = line
    ? `${line.startCity} ↔ ${line.endCity}`
    : TRIPS_ROUTE_LABEL;

  return (
    <Card className="mb-5 border-primary/25 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <ArrowLeftRight className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Ligne</p>
          <p className="mt-1 text-base font-semibold text-foreground">{routeLabel}</p>
          {line?.name ? (
            <p className="mt-1 text-sm text-muted-foreground">{line.name}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
