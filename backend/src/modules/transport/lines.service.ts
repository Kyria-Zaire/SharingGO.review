import type { Line } from "@prisma/client";
import { writeAuditLog } from "../../lib/audit-log.js";
import { AppError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateLineInput, UpdateLineInput } from "./lines.schemas.js";

export async function createLine(
  input: CreateLineInput,
  actorUserId: string
): Promise<Line> {
  const line = await prisma.line.create({ data: input });

  await writeAuditLog({
    actorUserId,
    action: "LINE_CREATED",
    targetType: "Line",
    targetId: line.id,
    metadata: { name: line.name },
  });

  return line;
}

export async function listLines(): Promise<Line[]> {
  return prisma.line.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getLineById(id: string): Promise<Line> {
  const line = await prisma.line.findUnique({ where: { id } });
  if (!line) {
    throw new AppError("Line not found", 404, "LINE_NOT_FOUND");
  }
  return line;
}

export async function updateLine(
  id: string,
  input: UpdateLineInput,
  actorUserId: string
): Promise<Line> {
  await getLineById(id);

  const line = await prisma.line.update({
    where: { id },
    data: input,
  });

  await writeAuditLog({
    actorUserId,
    action: "LINE_UPDATED",
    targetType: "Line",
    targetId: line.id,
    metadata: { fields: Object.keys(input) },
  });

  return line;
}
