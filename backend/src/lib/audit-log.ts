import type { Prisma } from "@prisma/client";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";

export interface AuditLogInput {
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Persists an audit log entry. On failure, logs a warning and does not throw
 * (CTO decision S1-T1: business action must not fail if audit write fails).
 */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    logger.warn("Audit log write failed", {
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
