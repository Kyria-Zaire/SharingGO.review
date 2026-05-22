import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

let cachedVersion: string | null = null;

/** Application version from package.json — never includes secrets. */
export function getAppVersion(): string {
  if (cachedVersion !== null) {
    return cachedVersion;
  }
  try {
    const pkgPath = join(dirname(fileURLToPath(import.meta.url)), "../../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
    cachedVersion = typeof pkg.version === "string" && pkg.version.trim() !== "" ? pkg.version : "unknown";
  } catch {
    cachedVersion = "unknown";
  }
  return cachedVersion;
}
