import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/stats/route";
import { getSessionUser } from "@/server/session";
import { getCategoryStats } from "@/server/statsService";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/statsService", () => ({ getCategoryStats: vi.fn() }));

const stats = {
  total: 8000,
  count: 1,
  categories: [{ category: "FOOD" as const, total: 8000, count: 1 }],
};

const request = (query: string) =>
  new Request(`http://localhost/api/stats${query}`);

beforeEach(() => {
  vi.mocked(getSessionUser)
    .mockReset()
    .mockResolvedValue({ id: "user-1", email: "user@mdiary.local" });
  vi.mocked(getCategoryStats).mockReset().mockResolvedValue(stats);
});

describe("GET /api/stats (데이터 아키텍처 8-1)", () => {
  it("로그인 사용자의 기간 합계를 돌려준다", async () => {
    const response = await GET(request("?from=2025-11&to=2026-10"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(stats);
    expect(getCategoryStats).toHaveBeenCalledWith("user-1", {
      from: "2025-11",
      to: "2026-10",
    });
  });

  it("기간이 잘못됐으면 400 VALIDATION", async () => {
    const response = await GET(request("?from=2021-10&to=2026-10"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: "VALIDATION",
      fields: { to: "OUT_OF_RANGE" },
    });
    expect(getCategoryStats).not.toHaveBeenCalled();
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect((await GET(request("?from=2026-10&to=2026-10"))).status).toBe(401);
  });
});
