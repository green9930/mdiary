import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH } from "@/app/api/expenses/[id]/route";
import {
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/server/expenseService";
import { getSessionUser } from "@/server/session";
import type { ExpenseDetail } from "@/types/expenseTypes";

vi.mock("@/server/session", async () => ({
  getSessionUser: vi.fn(),
  unauthorized: () => Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
}));
vi.mock("@/server/expenseService", () => ({
  getExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

const user = { id: "user-1", email: "user@mdiary.local" };
const id = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
const detail: ExpenseDetail = {
  expense: {
    id,
    date: "2026-10-18",
    title: "점심",
    category: "FOOD",
    amount: 8000,
    content: null,
  },
};

const call = (
  handler: typeof GET,
  method: string,
  body?: unknown,
  target = id,
) =>
  handler(
    new Request(`http://localhost/api/expenses/${target}`, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: target }) },
  );

beforeEach(() => {
  vi.mocked(getSessionUser).mockReset().mockResolvedValue(user);
  vi.mocked(getExpense).mockReset().mockResolvedValue(detail);
  vi.mocked(updateExpense).mockReset().mockResolvedValue({ updated: 1 });
  vi.mocked(deleteExpense).mockReset().mockResolvedValue({ deleted: 1 });
});

describe("GET /api/expenses/:id (데이터 아키텍처 8-1)", () => {
  it("로그인 사용자의 기록 1건을 돌려준다", async () => {
    const response = await call(GET, "GET");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(detail);
    expect(getExpense).toHaveBeenCalledWith("user-1", id);
  });

  it("없거나 남의 기록, 형식이 틀린 id는 404", async () => {
    vi.mocked(getExpense).mockResolvedValue(null);
    expect((await call(GET, "GET")).status).toBe(404);

    const response = await call(GET, "GET", undefined, "not-a-uuid");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ code: "NOT_FOUND" });
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await call(GET, "GET")).status).toBe(401);
  });
});

describe("PATCH /api/expenses/:id (데이터 아키텍처 8-1·8-3)", () => {
  it("바꾼 필드를 검증해 수정하고 바뀐 건수를 돌려준다", async () => {
    const response = await call(PATCH, "PATCH", {
      title: " 저녁 ",
      content: null,
      scope: { type: "one" },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ updated: 1 });
    expect(updateExpense).toHaveBeenCalledWith("user-1", id, {
      title: "저녁",
      content: null,
      scope: { type: "one" },
    });
  });

  it("바꾼 필드가 없거나 값이 틀리면 400 VALIDATION", async () => {
    const empty = await call(PATCH, "PATCH", { scope: { type: "one" } });
    expect(empty.status).toBe(400);

    const invalid = await call(PATCH, "PATCH", {
      amount: 0,
      scope: { type: "one" },
    });
    expect(await invalid.json()).toEqual({
      code: "VALIDATION",
      fields: { amount: "OUT_OF_RANGE" },
    });
    expect(updateExpense).not.toHaveBeenCalled();
  });

  it("없는 기록은 404, 고를 수 없는 범위는 400 SCOPE_NOT_ALLOWED", async () => {
    vi.mocked(updateExpense).mockResolvedValueOnce(null);
    expect(
      (await call(PATCH, "PATCH", { title: "a", scope: { type: "one" } }))
        .status,
    ).toBe(404);

    vi.mocked(updateExpense).mockResolvedValueOnce({
      error: "SCOPE_NOT_ALLOWED",
    });
    const response = await call(PATCH, "PATCH", {
      title: "a",
      scope: { type: "one" },
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "SCOPE_NOT_ALLOWED" });
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect(
      (await call(PATCH, "PATCH", { title: "a", scope: { type: "one" } }))
        .status,
    ).toBe(401);
  });
});

describe("DELETE /api/expenses/:id (데이터 아키텍처 8-1·8-3)", () => {
  it("기록을 지우고 지운 건수를 돌려준다", async () => {
    const response = await call(DELETE, "DELETE", { scope: { type: "one" } });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ deleted: 1 });
    expect(deleteExpense).toHaveBeenCalledWith("user-1", id);
  });

  it("범위가 없으면 400, 없는 기록은 404, 고를 수 없는 범위는 400 SCOPE_NOT_ALLOWED", async () => {
    expect((await call(DELETE, "DELETE", {})).status).toBe(400);

    vi.mocked(deleteExpense).mockResolvedValueOnce(null);
    expect(
      (await call(DELETE, "DELETE", { scope: { type: "one" } })).status,
    ).toBe(404);

    vi.mocked(deleteExpense).mockResolvedValueOnce({
      error: "SCOPE_NOT_ALLOWED",
    });
    expect(
      await (await call(DELETE, "DELETE", { scope: { type: "one" } })).json(),
    ).toEqual({ code: "SCOPE_NOT_ALLOWED" });
  });

  it("세션이 없으면 401", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect(
      (await call(DELETE, "DELETE", { scope: { type: "one" } })).status,
    ).toBe(401);
  });
});
