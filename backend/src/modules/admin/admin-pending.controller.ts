import type { Request, Response } from "express";
import { parseQuery } from "../../lib/zod-parse.js";
import { listAdminPendingQuerySchema } from "./admin.schemas.js";
import * as adminPendingService from "./admin-pending.service.js";

export async function listAdminPendingHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listAdminPendingQuerySchema, req.query);
  const result = await adminPendingService.listAdminPendingReservations(query);
  res.status(200).json(result);
}
