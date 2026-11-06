import { defineConfig, devices } from "@playwright/test";

import { E2E_DATABASE_URL } from "./prisma/db-url";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    // 테스트 로그인 경로(P3)는 운영 빌드에 없으므로 개발 서버로 띄운다.
    // DB는 docker-compose의 mdiary_e2e를 쓴다 (.env의 Neon 주소보다 먼저 적용된다)
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_TEST_LOGIN: "1",
      BETTER_AUTH_URL: `http://localhost:${PORT}`,
      DATABASE_URL: E2E_DATABASE_URL,
      DIRECT_URL: E2E_DATABASE_URL,
    },
  },
});
