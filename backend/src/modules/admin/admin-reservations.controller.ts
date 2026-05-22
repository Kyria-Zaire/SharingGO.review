import type { Request, Response } from "express";
import { parseQuery } from "../../lib/zod-parse.js";
import {
  adminIdParamSchema,
  listAdminReservationsQuerySchema,
} from "./admin.schemas.js";
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
