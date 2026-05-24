import type { BoardingConsumeResponse } from "@/types/boarding.types";
import { BoardingResultCard } from "./BoardingResultCard";

interface BoardingConsumeResultProps {
  result: BoardingConsumeResponse;
}

export function BoardingConsumeResult({ result }: BoardingConsumeResultProps) {
  if (result.consumed) {
    return (
      <BoardingResultCard
        ui={result.ui}
        passenger={result.passenger}
        trip={result.trip}
        reservationId={result.reservation.id}
        consumed
      />
    );
  }

  if (result.valid && !result.consumed && "reason" in result && result.reason === "BOARDING_ALREADY_USED") {
    return (
      <BoardingResultCard
        ui={result.ui}
        reason={result.reason}
        passenger={result.passenger}
        trip={result.trip}
        reservationId={result.reservation?.id}
      />
    );
  }

  return (
    <BoardingResultCard
      ui={result.ui}
      reason={"reason" in result ? result.reason : undefined}
    />
  );
}
