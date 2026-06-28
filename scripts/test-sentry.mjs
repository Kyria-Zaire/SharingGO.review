#!/usr/bin/env node
// test-sentry.mjs — Envoie un événement de test à Sentry pour valider la configuration.
//
// Usage (depuis la racine du repo) :
//   node scripts/test-sentry.mjs
//
// Ou avec DSN explicite :
//   SENTRY_DSN="https://..." node scripts/test-sentry.mjs
//
// Charge SENTRY_DSN depuis process.env, sinon depuis .env.prod local (gitignored).
//
// Exit 0 : événement envoyé avec succès.
// Exit 1 : SENTRY_DSN absent ou erreur d'envoi.
//
// Ce script est standalone — aucun endpoint HTTP n'est exposé dans le backend.

import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const backendPkg = resolve(repoRoot, "backend", "package.json");

/** Masque un DSN Sentry — ne jamais logger le secret ni l'hôte complet. */
function maskDsn(_dsn) {
  return "https://***@***.sentry.io/***";
}

function loadSentryDsnFromEnvFile() {
  const envFile = resolve(repoRoot, ".env.prod");
  if (!existsSync(envFile)) {
    return;
  }
  const lines = readFileSync(envFile, "utf-8").split("\n");
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

async function loadSentryModule() {
  try {
    const require = createRequire(backendPkg);
    const sentryEntry = require.resolve("@sentry/node");
    return import(pathToFileURL(sentryEntry).href);
  } catch {
    console.error("[ERROR] @sentry/node introuvable.");
    console.error("        Exécuter : cd backend && npm install");
    process.exit(1);
  }
}

if (!process.env.SENTRY_DSN) {
  loadSentryDsnFromEnvFile();
}

const dsn = process.env.SENTRY_DSN?.trim() ?? "";

if (
  dsn === "" ||
  dsn.includes("CHANGEME") ||
  dsn.includes("YOUR_SENTRY_DSN") ||
  dsn.includes("XXXXXXX")
) {
  console.error("[ERROR] SENTRY_DSN absent ou non configuré.");
  console.error("        Définir SENTRY_DSN ou renseigner .env.prod (local, gitignored).");
  console.error("        Source : Dashboard Sentry → Settings → Projects → SDK Setup");
  process.exit(1);
}

const Sentry = await loadSentryModule();

console.log("[INFO] Initialisation Sentry...");
console.log(`[INFO] DSN détecté (${maskDsn(dsn)})`);

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
