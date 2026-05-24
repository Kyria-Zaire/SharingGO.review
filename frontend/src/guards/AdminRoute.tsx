import { AdminLayout } from "@/components/layout/AdminLayout";
import { ADMIN_PANEL_ROLES } from "@/constants/roles";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";

export function AdminRoute() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={ADMIN_PANEL_ROLES}>
        <AdminLayout />
      </RequireRole>
    </RequireAuth>
  );
}
