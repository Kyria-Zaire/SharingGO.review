#!/usr/bin/env node
/**
 * DEPLOY-READY P0-03 — Static audit of passenger internal routes & links.
 * Run: node scripts/audit-internal-links.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "../src");

const ROUTE_PATTERNS = [
  "/",
  "/trips",
  "/help",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/notice",
  "/bookings",
  "/profile",
  "/profile/edit",
  "/settings",
  "/notifications",
  "/subscriptions",
  "/trips/:tripId/book",
  "/bookings/:reservationId",
  "/bookings/:reservationId/boarding-pass",
  "/login",
  "/register",
  "/trips/:tripId",
  "/bookings/payment/success",
  "/bookings/payment/cancel",
  "/bookings/pending/:pendingReservationId",
];

const REMOVED_PATTERNS = [
  /\/demo\b/i,
  /ui-demo/i,
  /VITE_ENABLE_UI_DEMO/i,
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      files.push(...walk(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function matchRoute(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  for (const pattern of ROUTE_PATTERNS) {
    const patSegs = pattern === "/" ? [] : pattern.split("/").filter(Boolean);
    if (patSegs.length !== segments.length && !pattern.includes(":")) {
      if (pattern !== "/" || segments.length !== 0) continue;
    }
    let ok = true;
    if (pattern === "/" && segments.length === 0) return pattern;
    if (patSegs.length !== segments.length) continue;
    for (let i = 0; i < patSegs.length; i++) {
      if (patSegs[i].startsWith(":")) continue;
      if (patSegs[i] !== segments[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return pattern;
  }
  return null;
}

function extractHelpFaqIds() {
  const content = readFileSync(join(SRC, "features/help/constants/help-content.ts"), "utf8");
  return [...content.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function extractContactAnchors() {
  const content = readFileSync(join(SRC, "features/contact/constants/contact-content.ts"), "utf8");
  return [...content.matchAll(/helpAnchor:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function extractShellLinks() {
  const content = readFileSync(join(SRC, "constants/shell-navigation.ts"), "utf8");
  const paths = [];
  for (const m of content.matchAll(/to:\s*ROUTES\.(\w+)/g)) paths.push({ kind: "route-const", value: m[1] });
  for (const m of content.matchAll(/to:\s*ROUTES\.home,\s*hash:\s*`#([^`]+)`/g))
    paths.push({ kind: "hash", value: `/#${m[1]}` });
  return paths;
}

function extractRouteConsts() {
  const content = readFileSync(join(SRC, "types/routes.ts"), "utf8");
  const map = {};
  for (const m of content.matchAll(/^\s+(\w+):\s*"([^"]+)"/gm)) {
    map[m[1]] = m[2];
  }
  return map;
}

function scanInternalPaths(files) {
  const found = new Map();
  const re =
    /(?:to=\{?[`'"]|to:\s*[`'"]|href=\{?[`'"]|navigate\(\s*[`'"])(\/[^`'")\s#?]+)/g;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const rel = relative(SRC, file);
    let m;
    while ((m = re.exec(text))) {
      let path = m[1].replace(/\/$/, "") || "/";
      if (path.startsWith("//") || path.includes("mailto:")) continue;
      const key = path.split("#")[0].split("?")[0] || "/";
      if (!found.has(key)) found.set(key, new Set());
      found.get(key).add(rel);
    }
  }
  return found;
}

const routeConsts = extractRouteConsts();
const helpIds = new Set(extractHelpFaqIds());
const contactAnchors = extractContactAnchors();
const files = walk(SRC);
const internalPaths = scanInternalPaths(files);

const issues = [];
const warnings = [];

for (const anchor of contactAnchors) {
  if (!helpIds.has(anchor)) {
    issues.push(`Contact FAQ anchor "${anchor}" missing from HELP_FAQ_ITEMS`);
  }
}

for (const [path, sources] of internalPaths) {
  for (const removed of REMOVED_PATTERNS) {
    if (removed.test(path)) {
      issues.push(`Removed/demo path "${path}" in ${[...sources].join(", ")}`);
    }
  }
  if (!matchRoute(path)) {
    warnings.push(`Unmatched internal path "${path}" (${[...sources].slice(0, 2).join(", ")})`);
  }
}

const shellLinks = extractShellLinks();
for (const link of shellLinks) {
  if (link.kind === "route-const") {
    const path = routeConsts[link.value];
    if (!path) issues.push(`shell-navigation references unknown ROUTES.${link.value}`);
    else if (!matchRoute(path)) issues.push(`shell-navigation ROUTES.${link.value} → ${path} not in router`);
  }
}

const legalFooter = ["legalTerms", "legalPrivacy", "legalNotice", "contact"];
for (const key of legalFooter) {
  if (!routeConsts[key]) issues.push(`Missing ROUTES.${key}`);
}

const requireAuthCheck = readFileSync(join(SRC, "components/auth/RequireAuth.tsx"), "utf8");
if (!requireAuthCheck.includes("state={{ from: location.pathname }}")) {
  issues.push("RequireAuth missing state.from redirect");
}

const loginCheck = readFileSync(join(SRC, "pages/LoginPage.tsx"), "utf8");
if (!loginCheck.includes("from")) {
  issues.push("LoginPage missing from state handling");
}

console.log("=== DEPLOY-READY P0-03 — Internal Links Audit ===\n");
console.log(`Files scanned: ${files.length}`);
console.log(`Unique internal paths: ${internalPaths.size}`);
console.log(`Route patterns: ${ROUTE_PATTERNS.length}`);
console.log(`Contact→Help anchors: ${contactAnchors.length} (${contactAnchors.join(", ")})`);
console.log(`Help FAQ ids: ${helpIds.size}`);

if (issues.length) {
  console.log(`\nFAIL (${issues.length}):`);
  for (const i of issues) console.log(`  ✗ ${i}`);
} else {
  console.log("\nFAIL: 0");
}

if (warnings.length) {
  console.log(`\nWARN (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
} else {
  console.log("WARN: 0 (static path scan)");
}

console.log("\nOrphan files (not routed, informational):");
const orphanCandidates = ["components/auth/DevDemoAuthHint.tsx"];
for (const f of orphanCandidates) {
  const full = join(SRC, f);
  try {
    readFileSync(full);
    const name = f.split("/").pop().replace(".tsx", "");
    const used = files.some((file) => {
      if (file.endsWith(f)) return false;
      return readFileSync(file, "utf8").includes(name);
    });
    if (!used) console.log(`  · ${f} (not imported)`);
  } catch {
    /* absent */
  }
}

process.exit(issues.length > 0 ? 1 : 0);
