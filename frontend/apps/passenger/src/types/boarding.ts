export type BoardingApiErrorCode =
  | "UNAUTHORIZED"
  | "RESERVATION_NOT_FOUND"
  | "RESERVATION_NOT_CONFIRMED"
  | "BOARDING_NOT_AVAILABLE"
  | "BOARDING_EXPIRED";

export interface BoardingQrPayload {
  format: "jwt";
  /** JWT signé HS256 — chaîne exacte à encoder dans le QR (QR_TEXT). */
  payload: string;
  recommendedEncoding: "QR_TEXT";
}

export interface BoardingQrResponse {
  reservationId: string;
  tripId: string;
  /** Expiration fenêtre embarquement (departureTime + 10 min) — source UI countdown. */
  expiresAt: string;
  qr: BoardingQrPayload;
}
