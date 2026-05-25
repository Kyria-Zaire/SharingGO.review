import type { Request, Response } from "express";
import { parseQuery } from "../../lib/zod-parse.js";
import { listActivityFeedQuerySchema } from "./admin-incidents.schemas.js";
import * as adminActivityFeedService from "./admin-activity-feed.service.js";

export async function listAdminActivityFeedHandler(
  req: Request,
  res: Response
): Promise<void> {
  const query = parseQuery(listActivityFeedQuerySchema, req.query);
  const result = await adminActivityFeedService.listAdminActivityFeed(query);
  res.status(200).json(result);
}
