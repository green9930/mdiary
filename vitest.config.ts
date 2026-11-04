import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { TEST_DATABASE_URL } from "./prisma/db-url";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

// DB 테스트는 docker-compose의 mdiary_test를 쓴다. 나머지 값은 src/env.ts 검증용 가짜 값이다
const dbTestEnv = {
  DATABASE_URL: TEST_DATABASE_URL,
  DIRECT_URL: TEST_DATABASE_URL,
  BETTER_AUTH_SECRET: "test-secret-0123456789abcdef0123456789",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "test-client-id",
  GOOGLE_CLIENT_SECRET: "test-client-secret",
  CRON_SECRET: "test-cron-0123456789abcdef0123456789ab",
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.db.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "db",
          environment: "node",
          include: ["src/server/**/*.db.test.ts"],
          // 같은 DB를 쓰므로 파일을 하나씩 돌린다
          fileParallelism: false,
          env: dbTestEnv,
          globalSetup: ["./vitest.db-setup.ts"],
        },
      },
    ],
  },
});
