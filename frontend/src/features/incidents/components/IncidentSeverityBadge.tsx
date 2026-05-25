import { cn } from "@/lib/cn";
import { INCIDENT_CRITICAL_PULSE_CLASS } from "@/features/incidents/constants/incidents-config";
import { INCIDENT_SEVERITY_LABELS } from "@/features/incidents/constants/incident-labels";
import { isOpenIncidentStatus } from "@/features/incidents/constants/incident-labels";
import type { IncidentSeverity, IncidentStatus } from "@/types/incidents.types";

const severityVariant: Record<
  IncidentSeverity,
  { className: string; pulseReady: boolean }
> = {
  LOW: { className: "border-primary/30 bg-primary/10 text-primary", pulseReady: false },
  MEDIUM: { className: "border-warning/30 bg-warning/10 text-warning", pulseReady: false },
  HIGH: { className: "border-warning/30 bg-warning/10 text-warning", pulseReady: false },
  CRITICAL: {
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    pulseReady: true,
  },
};

export function IncidentSeverityBadge({
  severity,
  status,
  className,
}: {
  severity: IncidentSeverity;
  status: IncidentStatus;
  className?: string;
}) {
  const config = severityVariant[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
        config.pulseReady &&
          isOpenIncidentStatus(status) &&
          severity === "CRITICAL" &&
          INCIDENT_CRITICAL_PULSE_CLASS,
        className
      )}
    >
      {INCIDENT_SEVERITY_LABELS[severity]}
    </span>
  );
}
