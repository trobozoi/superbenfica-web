import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Credenciais reais ficam em .env.test.local (não versionado); URLs em .env.local.
loadEnv({ path: ".env.test.local", quiet: true });
loadEnv({ path: ".env.local", quiet: true });

const PORT = Number(process.env.E2E_PORT ?? 3001);
const baseURL = `http://localhost:${PORT}`;

/**
 * A API limita o login a 5/min por IP. Por isso o projeto "setup" faz login UMA vez e
 * grava a sessão (cookies) em tests/e2e/.auth; os demais testes reaproveitam essa sessão.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "tests/e2e/.auth/cliente.json" },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
