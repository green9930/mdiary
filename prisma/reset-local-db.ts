import { execSync } from "node:child_process";

import pg from "pg";

// 로컬 테스트 DB(mdiary_test·mdiary_e2e)를 비우고 마이그레이션을 처음부터 다시 적용한다.
// DB가 없으면 만든다. localhost가 아니면 지우지 않는다.
export const resetLocalDatabase = async (
  target: "test" | "e2e",
  url: string,
) => {
  const { hostname, pathname } = new URL(url);
  const database = pathname.slice(1);
  if (hostname !== "localhost" || database !== `mdiary_${target}`) {
    throw new Error(`로컬 테스트 DB가 아니라서 비우지 않습니다: ${url}`);
  }

  const admin = new URL(url);
  admin.pathname = "/postgres";
  const adminClient = new pg.Client({ connectionString: admin.toString() });
  await adminClient.connect();
  const { rowCount } = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [database],
  );
  if (!rowCount) await adminClient.query(`CREATE DATABASE "${database}"`);
  await adminClient.end();

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await client.end();

  execSync("pnpm prisma migrate deploy", {
    env: { ...process.env, DB_TARGET: target },
    stdio: "pipe",
  });
};
