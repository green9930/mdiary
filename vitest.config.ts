import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

import { TEST_DATABASE_URL } from "./prisma/dbUrlConstants";

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

// 앱은 svgr(next.config.ts)로 SVG를 컴포넌트로 바꾼다. 테스트에서는 파일 이름만 남긴 <svg>로 바꾼다
const svgStub: Plugin = {
  name: "svg-stub",
  enforce: "pre",
  load: (id) => {
    if (!id.endsWith(".svg")) return null;
    const name = basename(id, ".svg");
    return `import { createElement } from "react";
const Icon = (props) => createElement("svg", { ...props, "data-icon": "${name}" });
export default Icon;`;
  },
};

export default defineConfig({
  plugins: [react(), svgStub],
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
