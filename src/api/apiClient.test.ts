import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch, isUnauthorized } from "@/api/apiClient";

const respond = (status: number, body: unknown) =>
  vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(Response.json(body, { status }));

describe("apiFetch (데이터 아키텍처 8-3)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("성공하면 JSON 본문을 돌려준다", async () => {
    respond(200, { items: [] });
    await expect(apiFetch("/api/expenses")).resolves.toEqual({ items: [] });
  });

  it("실패하면 상태와 code를 담은 ApiError를 던진다", async () => {
    respond(401, { code: "UNAUTHORIZED" });
    const error = await apiFetch("/api/expenses").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "UNAUTHORIZED" });
  });

  it("본문이 JSON이 아닌 실패도 ApiError다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Bad Gateway", { status: 502 }),
    );
    await expect(apiFetch("/api/expenses")).rejects.toMatchObject({
      status: 502,
      code: null,
    });
  });
});

describe("isUnauthorized", () => {
  it("401 ApiError만 참이다", () => {
    expect(isUnauthorized(new ApiError(401, "UNAUTHORIZED"))).toBe(true);
    expect(isUnauthorized(new ApiError(500, null))).toBe(false);
    expect(isUnauthorized(new TypeError("Failed to fetch"))).toBe(false);
  });
});
