export interface BoardingJwtClaims {
  sub: string;
  typ: "boarding";
  uid: string;
  tid: string;
  bt: string;
  iat: number;
  exp: number;
}

export interface BoardingTokenResponse {
  reservationId: string;
  tripId: string;
  /** Signed JWT — never the opaque DB token. */
  boardingToken: string;
  expiresAt: string;
}

export interface VerifiedBoardingPayload {
  reservationId: string;
  userId: string;
  tripId: string;
  opaqueBoardingToken: string;
  issuedAt: number;
  expiresAt: number;
}

export type BoardingTokenVerificationReason =
  | "invalid_signature"
  | "expired"
  | "invalid_payload"
  | "invalid_type";

export class BoardingTokenVerificationError extends Error {
  readonly reason: BoardingTokenVerificationReason;

  constructor(message: string, reason: BoardingTokenVerificationReason) {
    super(message);
    this.name = "BoardingTokenVerificationError";
    this.reason = reason;
  }
}
