import { useQuery } from "@tanstack/react-query";
import { listAdminUsers } from "@/api/admin-users.api";
import { queryKeys } from "@/constants/query-keys";
import { formatIncidentUserName } from "@/features/incidents/utils/format-incident-trip";
import type { AdminUserSafe } from "@/types/admin-users.types";
import type { AdminIncident } from "@/types/incidents.types";

const selectClassName =
  "mt-1 flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground";

export function IncidentAssignControl({
  incident,
  onAssign,
  isAssigning,
}: {
  incident: AdminIncident;
  onAssign: (userId: string | null) => void;
  isAssigning?: boolean;
}) {
  const teamQuery = useQuery({
    queryKey: queryKeys.settings.team({ assignable: true }),
    queryFn: () => listAdminUsers({ limit: 50, offset: 0 }),
    staleTime: 5 * 60 * 1000,
  });

  const assignableUsers = (teamQuery.data?.items ?? []).filter(
    (user: AdminUserSafe) => user.userType === "ADMIN" || user.userType === "SUPER_ADMIN"
  );

  const assigneeName = formatIncidentUserName(incident.assignee);

  return (
    <div>
      <dt className="uppercase tracking-wide text-muted-foreground">Assigné à</dt>
      <dd className="text-sm text-foreground">
        {assigneeName ?? <span className="text-muted-foreground">Non assigné</span>}
      </dd>
      {incident.status === "OPEN" || incident.status === "IN_PROGRESS" ? (
        <select
          className={selectClassName}
          value={incident.assignedToUserId ?? ""}
          disabled={isAssigning || teamQuery.isLoading}
          onChange={(event) => {
            const value = event.target.value;
            onAssign(value === "" ? null : value);
          }}
          aria-label={`Affecter ${incident.code}`}
        >
          <option value="">Non assigné</option>
          {assignableUsers.map((user) => {
            const label = formatIncidentUserName(user) ?? user.email;
            return (
              <option key={user.id} value={user.id}>
                {label}
              </option>
            );
          })}
        </select>
      ) : null}
    </div>
  );
}
