import type { Request, Response } from "express";
import { AppError } from "../../lib/errors.js";
import { parseBody, parseQuery } from "../../lib/zod-parse.js";
import {
  boardingReservationIdParamSchema,
  validateBoardingTokenBodySchema,
} from "./boarding.schemas.js";
import { getBoardingQrContract } from "./boarding.qr.service.js";
import { generateBoardingToken } from "./boarding.service.js";
import { consumeBoardingTokenSubmission } from "./boarding.consumption.service.js";
import { validateBoardingTokenSubmission } from "./boarding.validation.service.js";

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

export async function getBoardingQrContractHandler(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const { reservationId } = parseQuery(boardingReservationIdParamSchema, {
    reservationId: req.params.reservationId,
  });

  const result = await getBoardingQrContract(reservationId, userId);
  res.status(200).json(result);
}

export async function validateBoardingTokenHandler(req: Request, res: Response): Promise<void> {
  const adminUserId = requireUserId(req);
  const { boardingToken } = parseBody(validateBoardingTokenBodySchema, req.body);
  const result = await validateBoardingTokenSubmission(
    boardingToken,
    adminUserId,
    req.requestId
  );
  res.status(200).json(result);
}

export async function consumeBoardingTokenHandler(req: Request, res: Response): Promise<void> {
  const adminUserId = requireUserId(req);
  const { boardingToken } = parseBody(validateBoardingTokenBodySchema, req.body);
  const result = await consumeBoardingTokenSubmission(
    boardingToken,
    adminUserId,
    req.requestId
  );
  res.status(200).json(result);
}
