import { ApiError } from "@/api/http";

export function getTripLifecycleErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Erreur réseau. Vérifiez votre connexion puis réessayez.";
  }

  if (error.code === "INVALID_LIFECYCLE_TRANSITION" || error.status === 409) {
    return "L'état du trajet a changé, rafraîchissement…";
  }
  if (error.code === "TRIP_DISABLED" || error.status === 400) {
    return "Ce trajet est indisponible ou désactivé.";
  }
  if (error.code === "TRIP_NOT_FOUND" || error.status === 404) {
    return "Trajet introuvable. Il a peut-être été supprimé.";
  }
  return error.message || "Action impossible pour le moment.";
}

