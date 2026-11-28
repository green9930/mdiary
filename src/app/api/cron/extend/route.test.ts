import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/cron/extend/route";
import { extendContinuousSeries } from "@/server/seriesService";

vi.mock("@/env", () => ({
  env: { CRON_SECRET: "cron-secret-0123456789abcdef0123456789" },
}));
vi.mock("@/server/session", () => ({
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/seriesService", () => ({
  extendContinuousSeries: vi.fn(),
}));

const request = (authorization?: string) =>
  new Request("http://localhost/api/cron/extend", {
    headers: authorization ? { authorization } : {},
  });

beforeEach(() => {
  vi.mocked(extendContinuousSeries)
    .mockReset()
    .mockResolvedValue({ series: 2, created: 5 });
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-30T16:00:00Z")); // 서울 12월 1일
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GET /api/cron/extend (데이터 아키텍처 5-4 정기 작업)", () => {
  it("비밀값이 맞으면 모든 계속 반복을 이번 달(서울) + 24개월까지 연장한다", async () => {
    const response = await GET(
      request("Bearer cron-secret-0123456789abcdef0123456789"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ series: 2, created: 5 });
    expect(extendContinuousSeries).toHaveBeenCalledWith({
      untilMonth: "2028-12",
    });
  });

  it("비밀값이 없거나 다르면 401이고 연장하지 않는다", async () => {
    for (const authorization of [
      undefined,
      "Bearer wrong",
      "cron-secret-0123456789abcdef0123456789",
    ]) {
      const response = await GET(request(authorization));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ code: "UNAUTHORIZED" });
    }
    expect(extendContinuousSeries).not.toHaveBeenCalled();
  });
});
