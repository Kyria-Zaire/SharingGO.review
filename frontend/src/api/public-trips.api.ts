import { http } from "./http";

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

export interface PublicTripsListResponse {
  trips: PublicTrip[];
  limit: number;
  offset: number;
}

export async function listPublicTrips(params?: {
  from?: string;
  limit?: number;
}): Promise<PublicTripsListResponse> {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return http<PublicTripsListResponse>(`/api/trips${query ? `?${query}` : ""}`);
}
