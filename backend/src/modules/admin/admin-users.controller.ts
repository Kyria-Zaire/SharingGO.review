import type { Request, Response } from "express";
import { parseBody, parseQuery } from "../../lib/zod-parse.js";
import {
  adminUserIdParamSchema,
  createAdminUserBodySchema,
  listAdminUsersQuerySchema,
  patchAdminUserRoleBodySchema,
} from "./admin-users.schemas.js";
import * as adminUsersService from "./admin-users.service.js";

export async function listAdminUsersHandler(req: Request, res: Response): Promise<void> {
  const query = parseQuery(listAdminUsersQuerySchema, req.query);
  const result = await adminUsersService.listAdminUsers(query);
  res.status(200).json(result);
}

export async function createAdminUserHandler(req: Request, res: Response): Promise<void> {
  const body = parseBody(createAdminUserBodySchema, req.body);
  const user = await adminUsersService.createAdminUser(body, req.user!.id);
  res.status(201).json(user);
}

export async function patchAdminUserRoleHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminUserIdParamSchema, { id: req.params.id });
  const body = parseBody(patchAdminUserRoleBodySchema, req.body);
  const user = await adminUsersService.updateAdminUserRole(id, body, req.user!.id);
  res.status(200).json(user);
}

export async function disableAdminUserHandler(req: Request, res: Response): Promise<void> {
  const { id } = parseQuery(adminUserIdParamSchema, { id: req.params.id });
  const user = await adminUsersService.disableAdminUser(id, req.user!.id);
  res.status(200).json(user);
}
