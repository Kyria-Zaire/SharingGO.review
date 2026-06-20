export interface BoardingFailurePassengerContext {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface BoardingFailureContext {
  tripId?: string;
  reservationId?: string;
  reason: string;
  passenger?: BoardingFailurePassengerContext;
}

export function buildBoardingFailureContext(input: {
  tripId?: string;
  reservationId?: string;
  reason: string;
  passenger?: BoardingFailurePassengerContext;
}): BoardingFailureContext | undefined {
  if (!input.tripId && !input.reservationId) {
    return undefined;
  }
  return {
    tripId: input.tripId,
    reservationId: input.reservationId,
    reason: input.reason,
    passenger: input.passenger,
  };
}
