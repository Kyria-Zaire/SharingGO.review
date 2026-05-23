import type {
  BOARDING_QR_FORMAT,
  BOARDING_QR_RECOMMENDED_ENCODING,
} from "./boarding.qr.constants.js";

export interface BoardingQrContractDto {
  format: typeof BOARDING_QR_FORMAT;
  /** Signed JWT to encode as QR text — never the opaque DB token. */
  payload: string;
  recommendedEncoding: typeof BOARDING_QR_RECOMMENDED_ENCODING;
}

export interface BoardingQrContractResponse {
  reservationId: string;
  tripId: string;
  expiresAt: string;
  qr: BoardingQrContractDto;
}
