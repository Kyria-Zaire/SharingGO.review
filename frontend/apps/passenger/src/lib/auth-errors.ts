import { ApiError } from "@/api/http";

export function formatAuthError(error: unknown, fallback = "Connexion impossible."): string {
  if (error instanceof ApiError) {
    if (error.status === 0 || error.code === "NETWORK_ERROR") {
      return "Connexion indisponible — vérifiez votre réseau et réessayez.";
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
    return error.message;
  }
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return "Connexion indisponible — vérifiez votre réseau et réessayez.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
