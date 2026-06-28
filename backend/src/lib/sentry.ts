import * as Sentry from "@sentry/node";
import type { Request } from "express";

// Module routes → tag Sentry "module" pour filtrage rapide sans ouvrir chaque événement.
const MODULE_PATTERNS: Array<{ pattern: RegExp; module: string }> = [
  { pattern: /^\/api\/auth/, module: "auth" },
  { pattern: /^\/api\/payments/, module: "payments" },
  { pattern: /^\/api\/webhooks/, module: "payments" },
  { pattern: /^\/api\/subscriptions/, module: "subscriptions" },
  { pattern: /^\/api\/boarding/, module: "boarding" },
  { pattern: /^\/api\/reservations/, module: "bookings" },
  { pattern: /^\/api\/trips/, module: "trips" },
  { pattern: /^\/api\/admin/, module: "admin" },
];

function resolveModule(path: string): string {
  for (const { pattern, module } of MODULE_PATTERNS) {
    if (pattern.test(path)) return module;
  }
  return "core";
}

// Patterns de clés à supprimer dans beforeSend — protège PII, secrets et tokens.
const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /stripe/i,
  /whsec/i,
  /sk_/i,
  /DATABASE_URL/i,
];

// Headers entrants à supprimer systématiquement.
const BLOCKED_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
]);

function isSensitiveHeader(name: string): boolean {
  const lower = name.toLowerCase();
  if (BLOCKED_HEADERS.has(lower)) return true;
  // Supprimer les headers infrastructure qui révèlent l'IP réelle ou la config proxy.
  if (lower.startsWith("x-forwarded-")) return true;
  if (lower.startsWith("cf-")) return true;
  if (lower === "x-real-ip") return true;
  return false;
}

function sanitizeHeaders(
  headers: Record<string, string | string[] | undefined> | undefined,
): Record<string, string | string[]> {
  if (!headers) return {};
  return Object.fromEntries(
    Object.entries(headers).filter(([k]) => !isSensitiveHeader(k)),
  ) as Record<string, string | string[]>;
}

// Status codes ignorés par Sentry — erreurs métier normales, pas des bugs.
// RÈGLE CRITIQUE : une erreur métier qui provoque un 500 par bug DOIT être capturée.
// Ce filtre s'applique uniquement au status code final de la réponse, pas à la nature de l'erreur.
const IGNORED_STATUS_CODES = new Set([400, 401, 403, 404, 422, 429]);

export function initSentry(): void {
  const dsn = process.env["SENTRY_DSN"];

  // DSN absent ou vide → Sentry désactivé silencieusement (aucune exception levée).
  if (!dsn || dsn.trim() === "") {
    return;
  }

  const isProduction = process.env["NODE_ENV"] === "production";
  const sampleRate = parseFloat(
    process.env["SENTRY_TRACES_SAMPLE_RATE"] ?? "0.1",
  );

  Sentry.init({
    dsn,
    environment: process.env["NODE_ENV"] ?? "development",
    release: process.env["SENTRY_RELEASE"],

    // Performance Monitoring activé uniquement en production avec DSN configuré.
    // En développement : sample rate à 0 pour ne pas polluer le quota Sentry.
    tracesSampleRate: isProduction ? sampleRate : 0,

    // Tags globaux sur chaque événement — filtrage rapide dans le dashboard Sentry.
    initialScope: {
      tags: {
        service: "backend",
      },
    },

    beforeSend(event, hint) {
      // Filtrer les erreurs 4xx (erreurs métier intentionnelles).
      // Les erreurs 5xx et exceptions non catchées passent toujours.
      const status = (hint?.originalException as { statusCode?: number })
        ?.statusCode;
      if (typeof status === "number" && IGNORED_STATUS_CODES.has(status)) {
        return null;
      }

      // Sanitiser les headers de la requête.
      if (event.request?.headers) {
        // Les types Sentry pour headers sont { [key: string]: string } — on caste après filtrage.
        const filtered = sanitizeHeaders(
          event.request.headers as Record<string, string | string[] | undefined>,
        );
        event.request.headers = Object.fromEntries(
          Object.entries(filtered).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v]),
        );
      }

      // Supprimer le body complet — peut contenir des mots de passe, numéros de carte, etc.
      if (event.request) {
        event.request.data = "[Filtered]";
      }

      // Sanitiser les query params qui pourraient contenir des tokens.
      // Sentry attend QueryParams = string | { [key: string]: string } | [string, string][]
      // On normalise vers string pour éviter les incompatibilités de type.
      if (event.request?.query_string) {
        if (typeof event.request.query_string === "string") {
          if (SENSITIVE_KEY_PATTERNS.some((p) => p.test(event.request!.query_string as string))) {
            event.request.query_string = "[Filtered]";
          }
        } else {
          // Format objet ou tableau — convertir en string sanitisée pour simplicité.
          event.request.query_string = "[Filtered]";
        }
      }

      return event;
    },
  });
}

// Attache le requestId et les tags module/release/env au scope de la requête courante.
// À appeler depuis le middleware Sentry après requestIdMiddleware.
export function attachRequestContext(req: Request): void {
  const requestId =
    req.requestId ??
    req.header("x-request-id") ??
    "unknown";

  Sentry.getCurrentScope().setTag("requestId", requestId);
  Sentry.getCurrentScope().setTag("environment", process.env["NODE_ENV"] ?? "development");
  Sentry.getCurrentScope().setTag("release", process.env["SENTRY_RELEASE"] ?? "unknown");
  Sentry.getCurrentScope().setTag("module", resolveModule(req.path));
}

export function captureException(err: unknown, requestId?: string): void {
  Sentry.withScope((scope) => {
    if (requestId) {
      scope.setTag("requestId", requestId);
    }
    Sentry.captureException(err);
  });
}

// Handler d'erreur Express Sentry — à placer AVANT errorMiddleware dans app.ts,
// APRÈS toutes les routes. Capture les erreurs 5xx avant qu'elles soient formatées.
export function sentryErrorHandler(): ReturnType<typeof Sentry.expressErrorHandler> {
  return Sentry.expressErrorHandler({
    shouldHandleError(error) {
      // Capturer toutes les exceptions non catchées, quel que soit le status code.
      // Le filtrage 4xx est géré dans beforeSend pour éviter les doublons.
      const status = (error as { statusCode?: number; status?: number })
        ?.statusCode ??
        (error as { status?: number })?.status;

      // Si pas de status code ou status >= 500 → capturer.
      if (typeof status !== "number") return true;
      return status >= 500;
    },
  });
}
