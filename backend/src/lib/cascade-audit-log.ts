import type { Prisma } from "@prisma/client";

export interface CascadeAuditLogInput {
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Audit log écrit DANS une transaction. Contrairement à writeAuditLog (lib/audit-log.ts),
 * une erreur d'insert n'est PAS avalée : elle propage et fait rollback la transaction.
 * Réservé aux écritures transactionnelles de CASCADE-01.
 */
export async function writeCascadeAuditLog(
  tx: Prisma.TransactionClient,
  input: CascadeAuditLogInput
): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata ?? undefined,
    },
  });
}
