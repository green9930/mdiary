import { execSync } from "node:child_process";

import pg from "pg";

import { TEST_DATABASE_URL } from "./prisma/db-url";

// DB 테스트를 시작할 때마다 mdiary_test를 비우고 마이그레이션을 처음부터 다시 적용한다.
// 로컬 테스트 DB가 아니면 지우지 않는다.
export default async function setup() {
  const url = new URL(TEST_DATABASE_URL);
  if (url.hostname !== "localhost" || url.pathname !== "/mdiary_test") {
    throw new Error(
      `로컬 테스트 DB가 아니라서 비우지 않습니다: ${url.host}${url.pathname}`,
    );
  }

  const client = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await client.end();

  execSync("pnpm prisma migrate deploy", {
    env: { ...process.env, DB_TARGET: "test" },
    stdio: "pipe",
  });
}
