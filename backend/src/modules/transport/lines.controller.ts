import type { Request, Response } from "express";
import { parseBody } from "../../lib/zod-parse.js";
import { createLineSchema, updateLineSchema } from "./lines.schemas.js";
import * as linesService from "./lines.service.js";

function actorId(req: Request): string {
  if (!req.user) {
    throw new Error("requireAuth must run before lines handlers");
  }
  return req.user.id;
}

export async function createLineHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(createLineSchema, req.body);
  const line = await linesService.createLine(input, actorId(req));
  res.status(201).json({ line });
}

export async function listLinesHandler(_req: Request, res: Response): Promise<void> {
  const lines = await linesService.listLines();
  res.status(200).json({ lines });
}

export async function getLineHandler(req: Request, res: Response): Promise<void> {
  const line = await linesService.getLineById(req.params.id ?? "");
  res.status(200).json({ line });
}

export async function updateLineHandler(req: Request, res: Response): Promise<void> {
  const input = parseBody(updateLineSchema, req.body);
  const line = await linesService.updateLine(req.params.id ?? "", input, actorId(req));
  res.status(200).json({ line });
}
