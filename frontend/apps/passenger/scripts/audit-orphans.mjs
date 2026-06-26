#!/usr/bin/env node
/**
 * P1-01 — Static orphan file audit (passenger src).
 * Run: node scripts/audit-orphans.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const SKIP_FILES = new Set(["vite-env.d.ts", "main.tsx", "App.tsx"]);
const ROUTER = readFileSync(join(SRC, "app/router.tsx"), "utf8");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules") continue;
      out.push(...walk(full));
    } else if (/\.(tsx?)$/.test(entry) && !SKIP_FILES.has(entry)) {
      out.push(full);
    }
  }
  return out;
}

function primaryExportName(content, filePath) {
  const fn = content.match(/export function (\w+)/);
  if (fn) return fn[1];
  const cn = content.match(/export const (\w+)/);
  if (cn) return cn[1];
  return basename(filePath).replace(/\.(tsx|ts)$/, "");
}

function importReferences(name, files, selfPath) {
  const hits = [];
  const patterns = [
    `from "${name}"`,
    `from '${name}'`,
    `import { ${name}`,
    `import ${name} `,
    `import ${name} from`,
    `<${name}`,
    ` ${name}(`,
    `.${name}`,
  ];
  for (const [path, text] of files) {
    if (path === selfPath) continue;
    if (
      text.includes(name) &&
      (text.includes(`import`) || text.includes(`<${name}`) || text.includes(`${name}(`))
    ) {
      // crude but good enough: name appears outside self
      const re = new RegExp(`\\b${name}\\b`);
      if (re.test(text)) hits.push(relative(SRC, path).replace(/\\/g, "/"));
    }
  }
  return [...new Set(hits)];
}

const filePaths = walk(SRC);
const fileContents = new Map(
  filePaths.map((p) => [p, readFileSync(p, "utf8")])
);

const candidates = [];

for (const path of filePaths) {
  const rel = relative(SRC, path).replace(/\\/g, "/");
  const content = fileContents.get(path);
  const name = primaryExportName(content, path);
  const refs = importReferences(name, fileContents, path);

  const isPage = rel.startsWith("pages/");
  const pageFile = basename(path, ".tsx");
  const routed = isPage && ROUTER.includes(`@/pages/${pageFile}`);

  let status = "KEEP";
  if (refs.length === 0 && !routed) {
    status = "SAFE_DELETE";
  } else if (refs.length === 0 && routed) {
    status = "KEEP"; // routed page
  } else if (refs.length === 1 && refs[0].includes("index.ts")) {
    status = "UNCERTAIN";
  }

  if (status === "SAFE_DELETE" || rel.includes("Placeholder") || rel.includes("Demo")) {
    candidates.push({
      file: rel,
      export: name,
      routed: routed ? "yes" : "no",
      refCount: refs.length,
      refs: refs.slice(0, 5),
      status,
    });
  }
}

// Known orphan paths removed in P1-04-FINALIZE (ANO-M03 / ANO-M04).
for (const rel of [] as const) {
  const full = join(SRC, rel);
  if (!existsSync(full)) {
    candidates.push({
      file: rel,
      export: "-",
      routed: "no",
      refCount: 0,
      refs: [],
      status: "ALREADY_ABSENT",
    });
    continue;
  }
  if (!candidates.some((c) => c.file === rel)) {
    const name = primaryExportName(readFileSync(full, "utf8"), full);
    const refs = importReferences(name, fileContents, full);
    candidates.push({
      file: rel,
      export: name,
      routed: "no",
      refCount: refs.length,
      refs,
      status: refs.length === 0 ? "SAFE_DELETE" : "KEEP",
    });
  }
}

console.log("=== P1-01 Orphan Audit ===\n");
for (const c of candidates.sort((a, b) => a.file.localeCompare(b.file))) {
  console.log(`${c.status.padEnd(12)} ${c.file}`);
  console.log(`             export=${c.export} routed=${c.routed} refs=${c.refCount}`);
  if (c.refs.length) console.log(`             → ${c.refs.join(", ")}`);
}

const safe = candidates.filter((c) => c.status === "SAFE_DELETE");
console.log(`\nSAFE_DELETE: ${safe.length}`);
process.exit(0);
