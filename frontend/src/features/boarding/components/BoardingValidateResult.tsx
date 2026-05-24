import type { BoardingValidationResponse } from "@/types/boarding.types";
import { BoardingResultCard } from "./BoardingResultCard";

interface BoardingValidateResultProps {
  result: BoardingValidationResponse;
}

export function BoardingValidateResult({ result }: BoardingValidateResultProps) {
  if (result.valid) {
    return (
      <BoardingResultCard
        ui={{
          status: "success",
          title: "Contrôle valide",
          message: "QR accepté — aucune consommation effectuée (mode contrôle).",
        }}
        passenger={result.passenger}
        trip={result.trip}
        reservationId={result.reservation.id}
      />
    );
  }

  return (
    <BoardingResultCard
      ui={{
        status: "error",
        title: "Contrôle refusé",
        message: "Le serveur a rejeté ce QR — voir la raison ci-dessous.",
      }}
      reason={result.reason}
    />
  );
}
