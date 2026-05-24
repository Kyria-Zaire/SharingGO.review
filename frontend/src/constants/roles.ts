import type { UserType } from "@/types/auth.types";

/** Roles allowed on the global admin cockpit (F3-T1). */
export const ADMIN_PANEL_ROLES: UserType[] = ["ADMIN", "SUPER_ADMIN"];

export const ROLE_LABELS: Record<UserType, string> = {
  PASSENGER: "Passager",
  CONVOYEUR: "Convoyeur",
  DRIVER: "Chauffeur",
  ADMIN: "Administrateur",
  SUPER_ADMIN: "Super administrateur",
};

export function isAdminPanelRole(userType: UserType): boolean {
  return ADMIN_PANEL_ROLES.includes(userType);
}
