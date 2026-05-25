import type { AdminTeamRole } from "@/types/admin-users.types";

export const ADMIN_ROLE_LABELS: Record<AdminTeamRole, string> = {
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  DRIVER: "Chauffeur",
  CONVOYEUR: "Convoyeur",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminTeamRole, string> = {
  SUPER_ADMIN: "Accès complet plateforme et gestion équipe.",
  ADMIN: "Cockpit opérations, incidents, dispatch, transport.",
  DRIVER: "Boarding terrain et départs assignés.",
  CONVOYEUR: "Réservations et abonnements côté passager.",
};

export function isAdminRole(role: AdminTeamRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isDowngrade(from: AdminTeamRole, to: AdminTeamRole): boolean {
  return isAdminRole(from) && !isAdminRole(to);
}
