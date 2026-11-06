// docker-compose의 로컬 Postgres 주소. DB_TARGET(local·test·e2e)으로 고른다 (db-url.ts)
export const LOCAL_URLS = {
  local: "postgresql://postgres:postgres@localhost:5432/mdiary_dev",
  test: "postgresql://postgres:postgres@localhost:5432/mdiary_test",
  e2e: "postgresql://postgres:postgres@localhost:5432/mdiary_e2e",
} as const;

export type LocalTarget = keyof typeof LOCAL_URLS;

export const TEST_DATABASE_URL = LOCAL_URLS.test;
export const E2E_DATABASE_URL = LOCAL_URLS.e2e;
