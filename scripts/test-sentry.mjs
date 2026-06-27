#!/usr/bin/env node
// test-sentry.mjs — Envoie un événement de test à Sentry pour valider la configuration.
//
// Usage :
//   SENTRY_DSN="https://..." node scripts/test-sentry.mjs
//
// Ou via .env.prod (sourcé manuellement avant l'appel) :
//   export $(grep SENTRY_DSN /opt/sharinggo/.env.prod) && node scripts/test-sentry.mjs
//
// Exit 0 : événement envoyé avec succès.
// Exit 1 : SENTRY_DSN absent ou erreur d'envoi.
//
// Ce script est standalone — aucun endpoint HTTP n'est exposé dans le backend.

import * as Sentry from "@sentry/node";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Charger .env.prod si SENTRY_DSN non défini et fichier présent
const ENV_FILE = resolve(process.cwd(), ".env.prod");
if (!process.env.SENTRY_DSN && existsSync(ENV_FILE)) {
  const lines = readFileSync(ENV_FILE, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key === "SENTRY_DSN" && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const dsn = process.env.SENTRY_DSN;

if (!dsn || dsn.trim() === "" || dsn.includes("CHANGEME")) {
  console.error("[ERROR] SENTRY_DSN absent ou non configuré.");
  console.error("        Exporter SENTRY_DSN=https://... avant de lancer ce script.");
  console.error("        Source : Dashboard Sentry → Settings → Projects → SDK Setup");
  process.exit(1);
}

console.log("[INFO] Initialisation Sentry...");

Sentry.init({
  dsn,
  environment: process.env.NODE_ENV ?? "test",
  release: process.env.SENTRY_RELEASE ?? "test-sentry-script",
  tracesSampleRate: 0,
});

console.log("[INFO] Envoi d'un événement de test [TEST]...");

Sentry.withScope((scope) => {
  scope.setTag("service", "backend");
  scope.setTag("test", "true");
  scope.setLevel("info");
  Sentry.captureMessage("[TEST] SharingGO Sentry configuration test — peut être ignoré");
});

// Flush : attend que Sentry ait envoyé tous les événements en attente.
// Timeout 5 secondes — si le réseau est KO, on sortira avec une erreur.
const flushed = await Sentry.flush(5000);

if (!flushed) {
  console.error("[ERROR] Sentry n'a pas pu envoyer l'événement dans le délai imparti (5s).");
  console.error("        Vérifier la connectivité réseau et la validité du DSN.");
  process.exit(1);
}

console.log("");
console.log("✔ Événement Sentry de test envoyé.");
console.log("  Vérifier le dashboard Sentry pour confirmer la réception.");
console.log("  Projet : sharinggo-backend · Level : info · Tag : test=true");
console.log("  Le message '[TEST] SharingGO...' doit apparaître dans Issues ou dans la section Events.");
