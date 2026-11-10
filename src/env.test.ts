import { describe, expect, it, vi } from "vitest";

const VALID = {
  NODE_ENV: "development",
  DATABASE_URL: "postgresql://user:pw@host-pooler/db",
  DIRECT_URL: "postgresql://user:pw@host/db",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  CRON_SECRET: "b".repeat(32),
  E2E_TEST_LOGIN: "",
};

// env.ts는 불러올 때 process.env를 검사하므로 import보다 먼저 값을 채운다
vi.hoisted(() => {
  Object.assign(process.env, {
    DATABASE_URL: "postgresql://host/db",
    DIRECT_URL: "postgresql://host/db",
    BETTER_AUTH_SECRET: "a".repeat(32),
    BETTER_AUTH_URL: "http://localhost:3000",
    GOOGLE_CLIENT_ID: "id",
    GOOGLE_CLIENT_SECRET: "secret",
    CRON_SECRET: "b".repeat(32),
  });
});

const { parseEnv } = await import("@/env");

describe("parseEnv", () => {
  it("올바른 값이면 그대로 돌려준다", () => {
    expect(parseEnv(VALID)).toEqual(VALID);
  });

  it("빠진 변수의 이름을 알린다", () => {
    expect(() => parseEnv({ ...VALID, DATABASE_URL: undefined })).toThrow(
      "DATABASE_URL: 값이 없습니다",
    );
  });

  it("빈 값도 빠진 것으로 본다", () => {
    expect(() => parseEnv({ ...VALID, GOOGLE_CLIENT_ID: "" })).toThrow(
      "GOOGLE_CLIENT_ID",
    );
  });

  it("postgres 주소가 아니면 실패한다", () => {
    expect(() => parseEnv({ ...VALID, DIRECT_URL: "mysql://host/db" })).toThrow(
      "DIRECT_URL",
    );
  });

  it("비밀값이 32자보다 짧으면 실패한다", () => {
    expect(() => parseEnv({ ...VALID, BETTER_AUTH_SECRET: "short" })).toThrow(
      "BETTER_AUTH_SECRET: 32자 이상이어야 합니다",
    );
  });

  it("CRON_SECRET이 BETTER_AUTH_SECRET과 같으면 실패한다", () => {
    expect(() =>
      parseEnv({ ...VALID, CRON_SECRET: VALID.BETTER_AUTH_SECRET }),
    ).toThrow("CRON_SECRET: BETTER_AUTH_SECRET과 달라야 합니다");
  });

  it("E2E_TEST_LOGIN은 개발에서 켤 수 있다", () => {
    expect(parseEnv({ ...VALID, E2E_TEST_LOGIN: "1" }).E2E_TEST_LOGIN).toBe(
      "1",
    );
  });

  it("E2E_TEST_LOGIN은 운영에서 켤 수 없다", () => {
    expect(() =>
      parseEnv({ ...VALID, NODE_ENV: "production", E2E_TEST_LOGIN: "1" }),
    ).toThrow("E2E_TEST_LOGIN: 운영에서는 켤 수 없습니다");
  });

  it("E2E_TEST_LOGIN에 1이 아닌 값은 받지 않는다", () => {
    expect(() => parseEnv({ ...VALID, E2E_TEST_LOGIN: "true" })).toThrow(
      "E2E_TEST_LOGIN",
    );
  });

  it("오류 메시지에 값을 싣지 않는다", () => {
    const leaked = "leaked-secret-value";
    expect(() => parseEnv({ ...VALID, CRON_SECRET: leaked })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining(leaked) }),
    );
  });
});
