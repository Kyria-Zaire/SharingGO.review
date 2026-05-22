import type { Request, Response } from "express";
import { parseQuery } from "../../lib/zod-parse.js";
import { adminTripIdParamSchema } from "./admin.schemas.js";
import * as adminOccupancyService from "./admin-occupancy.service.js";

export async function getAdminTripOccupancyHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminTripIdParamSchema, { id: req.params.id });
  const result = await adminOccupancyService.getAdminTripOccupancy(id);
  res.status(200).json(result);
}
