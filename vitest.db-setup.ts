import { TEST_DATABASE_URL } from "./prisma/db-url";
import { resetLocalDatabase } from "./prisma/reset-local-db";

// DB 테스트를 시작할 때마다 mdiary_test를 비우고 마이그레이션을 처음부터 다시 적용한다.
const setup = async () => {
  await resetLocalDatabase("test", TEST_DATABASE_URL);
};

export default setup;
