export interface MonitoringLastUpdatedProps {
  at: Date | null;
}

export function MonitoringLastUpdated({ at }: MonitoringLastUpdatedProps) {
  if (!at) {
    return (
      <p className="text-sm text-muted-foreground">
        Last updated: <span className="font-medium text-foreground">—</span>
      </p>
    );
  }

  const time = at.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <p className="text-sm text-muted-foreground">
      Last updated: <span className="font-mono font-medium text-foreground">{time}</span>
    </p>
  );
}
