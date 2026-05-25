import { ApiError } from "@/api/http";

export function mapCreateUserError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "ADMIN_USER_EMAIL_ALREADY_EXISTS") {
      return "Cet email est déjà utilisé.";
    }
    return error.message;
  }
  return "Impossible de créer l'utilisateur.";
}

export function mapRoleChangeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "LAST_ADMIN_PROTECTED") {
      return "Impossible : il doit rester au moins un admin actif.";
    }
    if (error.code === "SELF_ROLE_CHANGE_FORBIDDEN") {
      return "Vous ne pouvez pas modifier votre propre rôle.";
    }
    return error.message;
  }
  return "Impossible de modifier le rôle.";
}

export function mapDisableUserError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "LAST_ADMIN_PROTECTED") {
      return "Impossible : il doit rester au moins un admin actif.";
    }
    if (error.code === "SELF_DELETE_FORBIDDEN") {
      return "Vous ne pouvez pas désactiver votre propre compte.";
    }
    return error.message;
  }
  return "Impossible de désactiver l'utilisateur.";
}
