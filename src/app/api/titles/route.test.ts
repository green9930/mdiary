import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/titles/route";
import { getSessionUser } from "@/server/session";
import { getTitles } from "@/server/titleService";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/titleService", () => ({ getTitles: vi.fn() }));

const titles = [
  {
    title: "쿠팡",
    uses: 3,
    lastUsedAt: "2026-10-18T00:00:00.000Z",
    lastCategory: "LIVING" as const,
  },
];

beforeEach(() => {
  vi.mocked(getSessionUser)
    .mockReset()
    .mockResolvedValue({ id: "user-1", email: "user@mdiary.local" });
  vi.mocked(getTitles).mockReset().mockResolvedValue(titles);
});

describe("GET /api/titles (데이터 아키텍처 8-1)", () => {
  it("로그인 사용자의 자주 쓴 제목을 돌려준다", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ titles });
    expect(getTitles).toHaveBeenCalledWith("user-1");
  });

  it("조회 중 오류가 나면 500 INTERNAL로 답한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getTitles).mockRejectedValue(new Error("db down"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "INTERNAL" });
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    expect((await GET()).status).toBe(401);
  });
});
