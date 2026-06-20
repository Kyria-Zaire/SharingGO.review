import type { Request, Response } from "express";
import { parseBody } from "../../lib/zod-parse.js";
import { fieldIncidentBodySchema } from "./field-incidents.schemas.js";
import { createFieldIncident } from "./field-incidents.service.js";

export async function createFieldIncidentHandler(req: Request, res: Response): Promise<void> {
  const body = parseBody(fieldIncidentBodySchema, req.body);
  const incident = await createFieldIncident(body, req.user!.id);
  res.status(201).json(incident);
}
