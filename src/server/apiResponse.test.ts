import { afterEach, describe, expect, it, vi } from "vitest";

import { withApiErrors } from "@/server/apiResponse";

afterEach(() => vi.restoreAllMocks());

describe("withApiErrors (데이터 아키텍처 8-3)", () => {
  it("처리한 응답은 그대로 돌려준다", async () => {
    const handler = withApiErrors(async () =>
      Response.json({ ok: true }, { status: 201 }),
    );

    const response = await handler();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("처리하지 못한 오류는 기록하고 500 INTERNAL로 답한다", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("db down");
    const handler = withApiErrors(async () => {
      throw error;
    });

    const response = await handler();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "INTERNAL" });
    expect(log).toHaveBeenCalledWith(expect.any(String), error);
  });

  it("받은 인자를 그대로 넘긴다", async () => {
    const handler = withApiErrors(async (request: Request) =>
      Response.json({ method: request.method }),
    );

    const response = await handler(
      new Request("http://localhost/api", { method: "POST" }),
    );

    expect(await response.json()).toEqual({ method: "POST" });
  });
});
