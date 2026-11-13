import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/api/apiClient";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";

const unauthorized = new ApiError(401, "UNAUTHORIZED");

describe("createQueryClient: 세션 만료 (화면 명세 RT)", () => {
  it("조회가 401이면 로그인으로 보낸다", async () => {
    const onUnauthorized = vi.fn();
    const client = createQueryClient({ onUnauthorized });

    await client
      .fetchQuery({
        queryKey: ["expenses"],
        queryFn: () => Promise.reject(unauthorized),
      })
      .catch(() => {});

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("401은 다시 시도하지 않고, 그 밖의 실패는 3번까지 다시 시도한다", () => {
    const retry = createQueryClient().getDefaultOptions().queries?.retry;
    if (typeof retry !== "function") throw new Error("retry 함수가 없다");

    expect(retry(0, unauthorized)).toBe(false);
    expect(retry(0, new ApiError(500, null))).toBe(true);
    expect(retry(2, new TypeError("Failed to fetch"))).toBe(true);
    expect(retry(3, new TypeError("Failed to fetch"))).toBe(false);
  });

  it("변경 요청이 401이어도 로그인으로 보낸다", async () => {
    const onUnauthorized = vi.fn();
    const client = createQueryClient({ onUnauthorized });

    await client
      .getMutationCache()
      .build(client, { mutationFn: () => Promise.reject(unauthorized) })
      .execute(undefined)
      .catch(() => {});

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("401이 아닌 오류는 화면이 처리한다", async () => {
    const onUnauthorized = vi.fn();
    const client = createQueryClient({ onUnauthorized });

    await client
      .fetchQuery({
        queryKey: ["expenses"],
        queryFn: () => Promise.reject(new ApiError(500, null)),
        retry: false,
      })
      .catch(() => {});

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
