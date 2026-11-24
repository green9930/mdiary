import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/calendar/route";
import { getMonthTotals } from "@/server/calendarService";
import { getSessionUser } from "@/server/session";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/calendarService", () => ({ getMonthTotals: vi.fn() }));

const totals = { total: 8000, days: [{ date: "2026-10-18", total: 8000 }] };

const request = (query: string) =>
  new Request(`http://localhost/api/calendar${query}`);

beforeEach(() => {
  vi.mocked(getSessionUser)
    .mockReset()
    .mockResolvedValue({ id: "user-1", email: "user@mdiary.local" });
  vi.mocked(getMonthTotals).mockReset().mockResolvedValue(totals);
});

describe("GET /api/calendar (데이터 아키텍처 8-1)", () => {
  it("로그인 사용자의 그 달 합계를 돌려준다", async () => {
    const response = await GET(request("?month=2026-10"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(totals);
    expect(getMonthTotals).toHaveBeenCalledWith("user-1", "2026-10");
  });

  it("month가 없거나 잘못됐으면 400 VALIDATION", async () => {
    for (const query of ["", "?month=2026-13", "?month=2026-1"]) {
      const response = await GET(request(query));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        code: "VALIDATION",
        fields: { month: "INVALID" },
      });
    }
    expect(getMonthTotals).not.toHaveBeenCalled();
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect((await GET(request("?month=2026-10"))).status).toBe(401);
  });
});
