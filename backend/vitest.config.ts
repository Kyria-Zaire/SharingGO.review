import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    fileParallelism: false, // une seule DB de test partagée — pas d'exécution parallèle
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
