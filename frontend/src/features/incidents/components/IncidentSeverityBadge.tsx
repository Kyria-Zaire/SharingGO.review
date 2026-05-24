import { cn } from "@/lib/cn";
import { INCIDENT_CRITICAL_PULSE_CLASS } from "@/features/incidents/constants/incidents-config";
import type { IncidentSeverity } from "@/types/incidents.types";

const severityConfig: Record<
  IncidentSeverity,
  { label: string; variant: "success" | "warning" | "destructive"; pulseReady: boolean }
> = {
  info: { label: "Info", variant: "success", pulseReady: false },
  warning: { label: "Warning", variant: "warning", pulseReady: false },
  critical: { label: "Critical", variant: "destructive", pulseReady: true },
};

export interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity;
  status?: "open" | "resolved";
  className?: string;
}

export function IncidentSeverityBadge({ severity, status = "open", className }: IncidentSeverityBadgeProps) {
  const config = severityConfig[severity];
  const variantClasses = {
    success: "border-primary/30 bg-primary/10 text-primary",
    warning: "border-warning/30 bg-warning/10 text-warning",
    destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        variantClasses[config.variant],
        config.pulseReady && status === "open" && INCIDENT_CRITICAL_PULSE_CLASS,
        className
      )}
    >
      {config.label}
    </span>
  );
}
