import { ApiError } from "@/api/http";
import { USER_MESSAGES } from "@/lib/user-facing-errors";

export function formatAuthError(error: unknown, fallback = "Connexion impossible."): string {
  if (error instanceof ApiError) {
    if (error.status === 0 || error.code === "NETWORK_ERROR") {
      return USER_MESSAGES.network;
    }
    if (error.code === "INVALID_CREDENTIALS") {
      return "Identifiants invalides. Vérifiez votre email et mot de passe.";
    }
    if (error.code === "ACCOUNT_DISABLED" || error.status === 403) {
      return "Ce compte n'est pas autorisé à se connecter.";
    }
    if (error.code === "EMAIL_ALREADY_EXISTS") {
      return "Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.";
    }
    return fallback;
  }
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return USER_MESSAGES.network;
  }
  if (error instanceof Error) {
    return fallback;
  }
  return fallback;
}
