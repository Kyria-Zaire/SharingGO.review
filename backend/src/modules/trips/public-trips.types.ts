export interface PublicTripLine {
  id: string;
  name: string;
  startCity: string;
  endCity: string;
}

export interface PublicTrip {
  id: string;
  line: PublicTripLine;
  departureTime: string;
  arrivalTime: string | null;
  totalSeats: number;
  reservedSeats: number;
  remainingSeats: number;
  isFull: boolean;
}

export interface PublicTripsListResult {
  trips: PublicTrip[];
  limit: number;
  offset: number;
}
