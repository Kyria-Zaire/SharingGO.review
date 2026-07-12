import type { Request, Response } from "express";
import { parseBody, parseQuery } from "../../lib/zod-parse.js";
import {
  adminIdParamSchema,
  listAdminReservationsQuerySchema,
} from "./admin.schemas.js";
import { cancelReservationBodySchema } from "./admin.schemas.js";
import * as adminReservationsService from "./admin-reservations.service.js";

export async function listAdminReservationsHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listAdminReservationsQuerySchema, req.query);
  const result = await adminReservationsService.listAdminReservations(query);
  res.status(200).json(result);
}

export async function getAdminReservationHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIdParamSchema, { id: req.params.id });
  const reservation = await adminReservationsService.getAdminReservation(id);
  res.status(200).json(reservation);
}

export async function cancelAdminReservationHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIdParamSchema, { id: req.params.id });
  const body = parseBody(cancelReservationBodySchema, req.body ?? {});
  const reservation = await adminReservationsService.cancelAdminReservation(
    id,
    req.user!.id,
    body.reason
  );
  res.status(200).json(reservation);
}

export async function refundAdminReservationHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIdParamSchema, { id: req.params.id });
  const reservation = await adminReservationsService.refundReservation(id, req.user!.id);
  res.status(200).json(reservation);
}

export async function creditAdminReservationHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIdParamSchema, { id: req.params.id });
  const reservation = await adminReservationsService.creditReservation(id, req.user!.id);
  res.status(200).json(reservation);
}
