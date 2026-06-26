#!/usr/bin/env node
/**
 * DEPLOY-READY P0-06 — Generate public/robots.txt from environment policy.
 *
 *   ROBOTS_POLICY=disallow | allow   (default: disallow)
 *   PUBLIC_SITE_URL=https://sharinggo.fr   (required when allow — Sitemap line)
 *
 * Run: pnpm generate:robots  (also runs automatically via prebuild)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "robots.txt");
const TEMPLATES = join(__dirname, "robots");

const DEFAULT_SITE_URL = "https://sharinggo.fr";

function normalizePolicy(value) {
  const raw = (value ?? "disallow").trim().toLowerCase();
  if (raw === "allow" || raw === "prod" || raw === "production") {
    return "allow";
  }
  if (raw === "disallow" || raw === "block" || raw === "noindex") {
    return "disallow";
  }
  console.warn(`[generate-robots] Unknown ROBOTS_POLICY="${value}" — using disallow.`);
  return "disallow";
}

function normalizeSiteUrl(value) {
  const raw = (value ?? DEFAULT_SITE_URL).trim();
  return raw.replace(/\/+$/, "");
}

const policy = normalizePolicy(process.env.ROBOTS_POLICY);
const siteUrl = normalizeSiteUrl(process.env.PUBLIC_SITE_URL);

let content;
if (policy === "allow") {
  const template = readFileSync(join(TEMPLATES, "allow.prod.template.txt"), "utf8");
  content = template.replaceAll("{{PUBLIC_SITE_URL}}", siteUrl);
} else {
  content = readFileSync(join(TEMPLATES, "disallow.template.txt"), "utf8");
}

writeFileSync(OUT, content, "utf8");

console.log(`[generate-robots] Wrote ${OUT}`);
console.log(`[generate-robots] policy=${policy} siteUrl=${siteUrl}`);
