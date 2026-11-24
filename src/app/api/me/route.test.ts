import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/me/route";
import { getAccountStats } from "@/server/accountService";
import { getSessionUser } from "@/server/session";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/accountService", () => ({ getAccountStats: vi.fn() }));

beforeEach(() => {
  vi.mocked(getSessionUser)
    .mockReset()
    .mockResolvedValue({ id: "user-1", email: "user@mdiary.local" });
  vi.mocked(getAccountStats).mockReset().mockResolvedValue({ totalCount: 42 });
});

describe("GET /api/me (데이터 아키텍처 8-1)", () => {
  it("이메일과 전체 건수를 돌려준다", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      email: "user@mdiary.local",
      totalCount: 42,
    });
    expect(getAccountStats).toHaveBeenCalledWith("user-1");
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });
});
