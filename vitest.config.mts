import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      // Mesmo escopo de sonar.coverage.exclusions: a lógica testável por unidade.
      // Páginas e componentes visuais são cobertos pelos testes E2E (Playwright).
      include: ["src/lib/**/*.ts", "src/stores/**/*.ts"],
      // lib/api/{products,orders,...}.ts só repassam chamadas ao axios: cobertos pelo E2E.
      exclude: [
        "src/**/*.d.ts",
        "src/lib/server/**",
        "src/lib/hooks/**",
        "src/lib/api/{auth,catalog,customers,orders,products}.ts",
      ],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
