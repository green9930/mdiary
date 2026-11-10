import { LOCAL_URLS } from "./dbUrlConstants";

type LocalTargetType = keyof typeof LOCAL_URLS;

// Prisma CLI(migrate·seed)가 붙을 DB 주소.
// DB_TARGET이 local·test·e2e면 docker-compose의 로컬 Postgres, 없으면 .env의 DIRECT_URL(Neon development).
const isLocalTarget = (target: string): target is LocalTargetType =>
  Object.hasOwn(LOCAL_URLS, target);

export const cliDatabaseUrl = (): string | undefined => {
  const target = process.env.DB_TARGET;
  if (target && isLocalTarget(target)) return LOCAL_URLS[target];
  if (target)
    throw new Error(`DB_TARGET은 local·test·e2e만 쓸 수 있습니다: ${target}`);

  try {
    process.loadEnvFile();
  } catch {
    // CI처럼 .env가 없는 곳은 환경 변수를 직접 받는다
  }
  // prisma generate처럼 DB에 붙지 않는 명령은 주소가 없어도 된다
  return process.env.DIRECT_URL;
};
