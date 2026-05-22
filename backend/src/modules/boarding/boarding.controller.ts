import type { Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { parseQuery } from "../../lib/zod-parse.js";
import { boardingReservationIdParamSchema } from "./boarding.schemas.js";
import { generateBoardingToken } from "./boarding.service.js";

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  return req.user.id;
}

export async function getBoardingTokenHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const { reservationId } = parseQuery(boardingReservationIdParamSchema, {
    reservationId: req.params.reservationId,
  });

  const result = await generateBoardingToken(reservationId, userId);
  res.status(200).json(result);
}
