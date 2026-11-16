import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/expenses/route";
import { createExpense } from "@/server/expenseService";
import { getSessionUser } from "@/server/session";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/expenseService", () => ({ createExpense: vi.fn() }));

const user = { id: "user-1", email: "user@mdiary.local" };

const body = {
  date: "2026-10-18",
  title: " 점심 ",
  category: "FOOD",
  amount: 8000,
  content: "",
  repeat: { type: "none" },
};

const request = (data: unknown) =>
  new Request("http://localhost/api/expenses", {
    method: "POST",
    body: typeof data === "string" ? data : JSON.stringify(data),
  });

beforeEach(() => {
  vi.mocked(getSessionUser).mockReset().mockResolvedValue(user);
  vi.mocked(createExpense)
    .mockReset()
    .mockResolvedValue({ id: "expense-1", date: "2026-10-18" });
});

describe("POST /api/expenses (데이터 아키텍처 8-1·8-3)", () => {
  it("검증을 거친 값으로 로그인 사용자의 기록을 만들고 201로 id와 날짜를 돌려준다", async () => {
    const response = await POST(request(body));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "expense-1",
      date: "2026-10-18",
    });
    expect(createExpense).toHaveBeenCalledWith("user-1", {
      ...body,
      title: "점심",
      content: null,
    });
  });

  it("검증에 실패하면 400과 필드별 코드를 돌려주고 저장하지 않는다", async () => {
    const response = await POST(request({ ...body, title: "", amount: 0 }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: "VALIDATION",
      fields: { title: "REQUIRED", amount: "OUT_OF_RANGE" },
    });
    expect(createExpense).not.toHaveBeenCalled();
  });

  it("본문이 JSON이 아니면 400", async () => {
    const response = await POST(request("not json"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "VALIDATION", fields: {} });
  });

  it("저장 중 오류가 나면 500 INTERNAL로 답한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(createExpense).mockRejectedValue(new Error("db down"));

    const response = await POST(request(body));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "INTERNAL" });
  });

  it("세션이 없으면 401이고 저장하지 않는다", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const response = await POST(request(body));

    expect(response.status).toBe(401);
    expect(createExpense).not.toHaveBeenCalled();
  });
});
