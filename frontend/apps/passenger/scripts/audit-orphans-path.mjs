#!/usr/bin/env node
/**
 * P1-01 — Path-based orphan audit (passenger src).
 * Run: node scripts/audit-orphans-path.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const ROUTER = readFileSync(join(SRC, "app/router.tsx"), "utf8");
const SKIP = new Set(["vite-env.d.ts", "main.tsx", "App.tsx"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(tsx?)$/.test(entry) && !SKIP.has(entry)) {
      out.push(full);
    }
  }
  return out;
}

function resolveImport(spec, fromRel) {
  if (!spec.startsWith("@/") && !spec.startsWith(".")) return null;
  const base = spec.startsWith("@/")
    ? join(SRC, spec.slice(2))
    : join(dirname(join(SRC, fromRel)), spec);

  for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) {
      return relative(SRC, p).replace(/\\/g, "/");
    }
  }
  return null;
}

const filePaths = walk(SRC);
const fileContents = filePaths.map((p) => [
  relative(SRC, p).replace(/\\/g, "/"),
  readFileSync(p, "utf8"),
]);

const importers = new Map();
const importRe = /from\s+["']([^"']+)["']/g;

for (const [rel, text] of fileContents) {
  let m;
  while ((m = importRe.exec(text)) !== null) {
    const target = resolveImport(m[1], rel);
    if (!target) continue;
    if (!importers.has(target)) importers.set(target, []);
    importers.get(target).push(rel);
  }
}

const results = [];

for (const [rel] of fileContents) {
  const refs = [...new Set(importers.get(rel) ?? [])];
  const isPage = rel.startsWith("pages/");
  const pageName = basename(rel, ".tsx");
  const routed = isPage && ROUTER.includes(`@/pages/${pageName}`);

  let status = "KEEP";
  let reason = refs.length ? `importé par ${refs.length} fichier(s)` : "aucun import path résolu";

  if (isPage && !routed) {
    status = "SAFE_DELETE";
    reason = `page non routée (router.tsx sans @/pages/${pageName})`;
  } else if (refs.length === 0) {
    status = "SAFE_DELETE";
    reason = "0 import path vers ce fichier";
  } else if (
    rel === "components/layout/PassengerBottomNav.tsx" &&
    refs.length === 1 &&
    refs[0] === "components/layout/index.ts"
  ) {
    status = "SAFE_DELETE";
    reason = "barrel export only — aucun consommateur hors index.ts";
  }

  results.push({ file: rel, status, importers: refs, reason });
}

const byStatus = (s) => results.filter((r) => r.status === s).sort((a, b) => a.file.localeCompare(b.file));

console.log("=== SAFE_DELETE ===");
for (const r of byStatus("SAFE_DELETE")) {
  console.log(`- ${r.file}`);
  console.log(`  reason: ${r.reason}`);
  if (r.importers.length) console.log(`  importers: ${r.importers.join(", ")}`);
}

console.log("\n=== UNCERTAIN ===");
for (const r of byStatus("UNCERTAIN")) {
  console.log(`- ${r.file}: ${r.reason}`);
}

console.log("\n=== KPI ===");
console.log(`total files: ${results.length}`);
console.log(`SAFE_DELETE: ${byStatus("SAFE_DELETE").length}`);
console.log(`KEEP: ${byStatus("KEEP").length}`);
console.log(`UNCERTAIN: ${byStatus("UNCERTAIN").length}`);
