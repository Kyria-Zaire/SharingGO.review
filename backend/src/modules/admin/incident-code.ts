import { prisma } from "../../lib/prisma.js";

function parseCodeNumber(code: string): number {
  const match = /^INC-(\d+)$/.exec(code.trim());
  return match?.[1] ? Number.parseInt(match[1], 10) : 0;
}

export function formatIncidentCode(sequence: number): string {
  return `INC-${String(sequence).padStart(4, "0")}`;
}

export async function generateNextIncidentCode(): Promise<string> {
  const last = await prisma.incident.findFirst({
    orderBy: { code: "desc" },
    select: { code: true },
  });
  const next = (last ? parseCodeNumber(last.code) : 0) + 1;
  return formatIncidentCode(next);
}
