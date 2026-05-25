import type { Request, Response } from "express";
import { parseBody, parseQuery } from "../../lib/zod-parse.js";
import {
  adminIncidentIdParamSchema,
  createAdminIncidentBodySchema,
  importLocalIncidentsBodySchema,
  listAdminIncidentsQuerySchema,
  patchAdminIncidentBodySchema,
} from "./admin-incidents.schemas.js";
import * as adminIncidentsService from "./admin-incidents.service.js";

export async function listAdminIncidentsHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listAdminIncidentsQuerySchema, req.query);
  const result = await adminIncidentsService.listAdminIncidents(query);
  res.status(200).json(result);
}

export async function getAdminIncidentHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIncidentIdParamSchema, { id: req.params.id });
  const incident = await adminIncidentsService.getAdminIncident(id);
  res.status(200).json(incident);
}

export async function createAdminIncidentHandler(req: Request, res: Response): Promise<void> {
  const body = parseBody(createAdminIncidentBodySchema, req.body);
  const userId = req.user!.id;
  const incident = await adminIncidentsService.createAdminIncident(body, userId);
  res.status(201).json(incident);
}

export async function patchAdminIncidentHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIncidentIdParamSchema, { id: req.params.id });
  const body = parseBody(patchAdminIncidentBodySchema, req.body);
  const incident = await adminIncidentsService.patchAdminIncident(id, body, req.user!.id);
  res.status(200).json(incident);
}

export async function deleteAdminIncidentHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminIncidentIdParamSchema, { id: req.params.id });
  const incident = await adminIncidentsService.closeAdminIncident(id, req.user!.id);
  res.status(200).json(incident);
}

export async function importLocalIncidentsHandler(req: Request, res: Response): Promise<void> {
  const body = parseBody(importLocalIncidentsBodySchema, req.body);
  const result = await adminIncidentsService.importLocalIncidents(body, req.user!.id);
  res.status(200).json(result);
}
