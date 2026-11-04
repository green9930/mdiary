// Prisma CLI(migrate·seed)가 붙을 DB 주소.
// DB_TARGET이 local·test면 docker-compose의 로컬 Postgres, 없으면 .env의 DIRECT_URL(Neon development).
const LOCAL_URLS = {
  local: "postgresql://postgres:postgres@localhost:5432/mdiary_dev",
  test: "postgresql://postgres:postgres@localhost:5432/mdiary_test",
} as const;

export function cliDatabaseUrl(): string | undefined {
  const target = process.env.DB_TARGET;
  if (target === "local" || target === "test") return LOCAL_URLS[target];
  if (target)
    throw new Error(`DB_TARGET은 local 또는 test만 쓸 수 있습니다: ${target}`);

  try {
    process.loadEnvFile();
  } catch {
    // CI처럼 .env가 없는 곳은 환경 변수를 직접 받는다
  }
  // prisma generate처럼 DB에 붙지 않는 명령은 주소가 없어도 된다
  return process.env.DIRECT_URL;
}

export const TEST_DATABASE_URL = LOCAL_URLS.test;
