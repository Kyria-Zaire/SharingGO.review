import type { Request, Response } from "express";
import { parseQuery } from "../../lib/zod-parse.js";
import { listAdminPaymentsQuerySchema } from "./admin.schemas.js";
import * as adminPaymentsService from "./admin-payments.service.js";

export async function listAdminPaymentsHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listAdminPaymentsQuerySchema, req.query);
  const result = await adminPaymentsService.listAdminPayments(query);
  res.status(200).json(result);
}
