import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
interface ActivityFiltersProps {
  /** Types distincts issus des événements chargés (pour le filtre type). */
  availableTypes: string[];
}

export function ActivityFilters({ availableTypes }: ActivityFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const severity = searchParams.get("severity") ?? "all";
  const type = searchParams.get("type") ?? "all";

  const sortedTypes = useMemo(
    () => [...availableTypes].sort((a, b) => a.localeCompare(b)),
    [availableTypes]
  );

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all" || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Sévérité
        <select
          value={severity}
          onChange={(event) => updateParam("severity", event.target.value)}
          className="flex h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
          aria-label="Filtrer par sévérité"
        >
          <option value="all">Toutes</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Type
        <select
          value={type}
          onChange={(event) => updateParam("type", event.target.value)}
          className="flex h-9 min-w-[10rem] rounded-md border border-border bg-background px-3 text-sm text-foreground"
          aria-label="Filtrer par type d'événement"
        >
          <option value="all">Tous</option>
          {sortedTypes.map((eventType) => (
            <option key={eventType} value={eventType}>
              {eventType}
            </option>
          ))}
        </select>
      </label>

      <p className="text-xs text-muted-foreground">
        Filtres envoyés à l&apos;API (severity, type). Rafraîchissement auto 30s.
      </p>
    </div>
  );
}
