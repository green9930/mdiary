import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/expenses/[id]/scope/route";
import { getScopePreview } from "@/server/scopeService";
import { getSessionUser } from "@/server/session";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/scopeService", () => ({ getScopePreview: vi.fn() }));

const id = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
const preview = {
  remaining: 6,
  affected: {
    count: 6,
    fromMonth: "2026-10",
    toMonth: "2027-03",
    continuous: false,
  },
};

const call = (query: string, target = id) =>
  GET(new Request(`http://localhost/api/expenses/${target}/scope?${query}`), {
    params: Promise.resolve({ id: target }),
  });

beforeEach(() => {
  vi.mocked(getSessionUser)
    .mockReset()
    .mockResolvedValue({ id: "user-1", email: "user@mdiary.local" });
  vi.mocked(getScopePreview).mockReset().mockResolvedValue(preview);
});

describe("GET /api/expenses/:id/scope (데이터 아키텍처 8-1 범위 미리보기)", () => {
  it("범위·바꾼 날짜로 미리보기를 돌려준다", async () => {
    const response = await call("scope=after&date=2027-01-03");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(preview);
    expect(getScopePreview).toHaveBeenCalledWith(
      "user-1",
      id,
      { type: "after" },
      "2027-01-03",
    );
  });

  it("쿼리가 틀리면 400, 없는 기록·틀린 id는 404, 고를 수 없으면 400 SCOPE_NOT_ALLOWED", async () => {
    expect((await call("scope=count")).status).toBe(400);

    expect((await call("scope=one", "not-a-uuid")).status).toBe(404);
    vi.mocked(getScopePreview).mockResolvedValueOnce(null);
    expect((await call("scope=one")).status).toBe(404);

    vi.mocked(getScopePreview).mockResolvedValueOnce({
      error: "SCOPE_NOT_ALLOWED",
    });
    expect(await (await call("scope=count&n=9")).json()).toEqual({
      code: "SCOPE_NOT_ALLOWED",
    });
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await call("scope=one")).status).toBe(401);
  });
});
