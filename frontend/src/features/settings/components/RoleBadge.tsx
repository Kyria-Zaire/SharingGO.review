import { cn } from "@/lib/cn";
import { ADMIN_ROLE_LABELS } from "@/features/settings/constants/role-labels";
import type { AdminTeamRole } from "@/types/admin-users.types";

const toneClass: Record<AdminTeamRole, string> = {
  SUPER_ADMIN: "border-destructive/40 text-destructive",
  ADMIN: "border-primary/40 text-primary",
  DRIVER: "border-warning/40 text-warning",
  CONVOYEUR: "border-border text-muted-foreground",
};

export function RoleBadge({ role, className }: { role: AdminTeamRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass[role],
        className
      )}
    >
      {ADMIN_ROLE_LABELS[role]}
    </span>
  );
}
