import { Badge } from "@/components/ui/Badge";
import type { AdminUserStatus } from "@/types/admin-users.types";

const variantByStatus: Record<AdminUserStatus, "success" | "default"> = {
  ACTIVE: "success",
  DISABLED: "default",
};

const labelByStatus: Record<AdminUserStatus, string> = {
  ACTIVE: "Actif",
  DISABLED: "Désactivé",
};

export function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  return <Badge variant={variantByStatus[status]}>{labelByStatus[status]}</Badge>;
}
