import { logger } from "../../lib/logger.js";
import { generateBoardingToken } from "./boarding.service.js";
import {
  BOARDING_QR_FORMAT,
  BOARDING_QR_RECOMMENDED_ENCODING,
} from "./boarding.qr.constants.js";
import type { BoardingQrContractResponse } from "./boarding.qr.types.js";

/**
 * Returns a QR display contract for frontend/mobile — no image rendering (S2-T4).
 * Reuses S2-T1 generateBoardingToken for ownership, expiration, and DB opaque token.
 */
export async function getBoardingQrContract(
  reservationId: string,
  userId: string
): Promise<BoardingQrContractResponse> {
  const tokenResult = await generateBoardingToken(reservationId, userId);

  logger.info("Boarding QR contract generated", {
    reservationId: tokenResult.reservationId,
    tripId: tokenResult.tripId,
    userId,
  });

  return {
    reservationId: tokenResult.reservationId,
    tripId: tokenResult.tripId,
    expiresAt: tokenResult.expiresAt,
    qr: {
      format: BOARDING_QR_FORMAT,
      payload: tokenResult.boardingToken,
      recommendedEncoding: BOARDING_QR_RECOMMENDED_ENCODING,
    },
  };
}
