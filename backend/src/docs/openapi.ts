import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

/** OpenAPI 3.x document — source of truth: `openapi.json` alongside this file. */
export const openApiDocument = JSON.parse(
  readFileSync(join(dir, "openapi.json"), "utf8")
) as Record<string, unknown>;
