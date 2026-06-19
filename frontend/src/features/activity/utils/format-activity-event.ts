import { formatShortId } from "@/lib/format-id";
import type { ActivityFeedEvent } from "@/types/incidents.types";

export interface ActivityEventPresentation {
  summary: string;
  technicalDetail?: string;
}

function truncateId(value: string, max = 24): string {
  if (value.length <= max) return value;
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

function parseMetadata(description?: string): Record<string, unknown> | null {
  if (!description?.trim()) return null;
  const trimmed = description.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function stringField(meta: Record<string, unknown>, key: string): string | undefined {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function formatKnownAuditEvent(
  type: string,
  meta: Record<string, unknown> | null,
  entityId?: string
): string | null {
  const tripId = meta ? stringField(meta, "tripId") : undefined;
  const reservationId = entityId ?? (meta ? stringField(meta, "reservationId") : undefined);
  const eventId = meta ? stringField(meta, "eventId") : undefined;
  const sessionId = meta ? stringField(meta, "checkoutSessionId") ?? stringField(meta, "sessionId") : undefined;
  const reason = meta ? stringField(meta, "reason") : undefined;

  switch (type) {
    case "STRIPE_WEBHOOK_RECEIVED":
      return eventId
        ? `Webhook Stripe reçu — ${truncateId(eventId)}`
        : "Webhook Stripe reçu";
    case "STRIPE_WEBHOOK_DUPLICATE":
      return eventId
        ? `Webhook Stripe dupliqué (ignoré) — ${truncateId(eventId)}`
        : "Webhook Stripe dupliqué (ignoré)";
    case "CHECKOUT_CREATED":
      return sessionId
        ? `Session checkout créée — ${truncateId(sessionId)}`
        : "Session checkout créée";
    case "BOARDING_CONSUMED":
      return reservationId
        ? `Passager embarqué — résa ${formatShortId(reservationId)}`
        : "Passager embarqué";
    case "BOARDING_VALIDATION_SUCCESS":
    case "BOARDING_VALIDATED":
      return reservationId
        ? `Contrôle boarding valide — résa ${formatShortId(reservationId)}`
        : "Contrôle boarding valide";
    case "BOARDING_VALIDATION_FAILED":
    case "BOARDING_TOKEN_EXPIRED":
    case "BOARDING_TOKEN_REVOKED":
      return reason
        ? `Contrôle boarding refusé — ${reason}`
        : "Contrôle boarding refusé";
    case "INCIDENT_CREATED":
      return "Incident signalé";
    case "INCIDENT_RESOLVED":
      return "Incident résolu";
    default:
      if (tripId) {
        return `Trajet ${formatShortId(tripId)}`;
      }
      return null;
  }
}

export function formatActivityEvent(event: ActivityFeedEvent): ActivityEventPresentation {
  if (event.type === "INCIDENT_CREATED" || event.type === "INCIDENT_RESOLVED") {
    return {
      summary: event.description ?? event.title,
      technicalDetail: event.entityId ? `Incident ${formatShortId(event.entityId)}` : undefined,
    };
  }

  const meta = parseMetadata(event.description);
  const known = formatKnownAuditEvent(event.type, meta, event.entityId);

  if (known) {
    return {
      summary: known,
      technicalDetail: meta ? JSON.stringify(meta, null, 2) : event.description,
    };
  }

  if (event.description && !meta) {
    const trimmed = event.description.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      return {
        summary: trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed,
      };
    }
  }

  if (meta) {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(meta)) {
      if (value === null || value === undefined) continue;
      const text = typeof value === "string" ? truncateId(value) : String(value);
      parts.push(`${key}: ${text}`);
    }
    if (parts.length > 0) {
      return {
        summary: parts.slice(0, 3).join(" · "),
        technicalDetail: JSON.stringify(meta, null, 2),
      };
    }
  }

  return {
    summary: event.title,
    technicalDetail: event.description,
  };
}
