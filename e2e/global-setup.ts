import pg from "pg";

import { E2E_DATABASE_URL } from "../prisma/dbUrlConstants";
import { resetLocalDatabase } from "../prisma/reset-local-db";
import { TEST_USER } from "../src/server/tests/testUserConstants";

// E2E를 시작할 때마다 mdiary_e2e를 비우고 마이그레이션을 처음부터 다시 적용한다.
// 테스트 사용자를 미리 만들어 둔다. 테스트가 동시에 로그인해도 사용자를 두 번 만들지 않게 한다.
const globalSetup = async () => {
  await resetLocalDatabase("e2e", E2E_DATABASE_URL);

  const client = new pg.Client({ connectionString: E2E_DATABASE_URL });
  await client.connect();
  await client.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", "updatedAt") VALUES ($1, $2, $3, true, now())`,
    [TEST_USER.id, TEST_USER.name, TEST_USER.email],
  );
  await client.end();
};

export default globalSetup;
