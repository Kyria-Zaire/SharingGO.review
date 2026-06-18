import { prisma } from "./prisma.js";

/** Met à jour lastLoginAt — appeler après login email/password ou OAuth (Google, futur). */
export async function recordUserLastLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}
