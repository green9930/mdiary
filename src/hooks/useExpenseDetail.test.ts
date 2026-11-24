// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useExpenseDetail } from "@/hooks/useExpenseDetail";
import { useUpdateExpense } from "@/hooks/useUpdateExpense";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

const id = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
const detail = {
  expense: {
    id,
    date: "2026-10-18",
    title: "점심",
    category: "FOOD",
    amount: 8000,
    content: null,
  },
};

const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
};

const mockFetch = (body: unknown) =>
  vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => Response.json(body));

afterEach(() => vi.restoreAllMocks());

describe("useExpenseDetail (데이터 아키텍처 8-4 expenseDetail)", () => {
  it("GET /api/expenses/:id의 기록을 돌려준다", async () => {
    const fetch = mockFetch(detail);
    const { wrapper } = setup();
    const { result } = renderHook(() => useExpenseDetail(id), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(detail));
    expect(String(fetch.mock.calls[0]?.[0])).toBe(`/api/expenses/${id}`);
  });

  it("id가 없거나 꺼 두면 요청하지 않는다", () => {
    const fetch = mockFetch(detail);
    const { wrapper } = setup();
    renderHook(() => useExpenseDetail(null), { wrapper });
    renderHook(() => useExpenseDetail(id, { enabled: false }), { wrapper });

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useUpdateExpense · useDeleteExpense (데이터 아키텍처 8-1·8-4)", () => {
  it("수정은 PATCH로 바꾼 필드를 보내고, 성공하면 지출 관련 조회를 무효화한다", async () => {
    const fetch = mockFetch({ updated: 1 });
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useUpdateExpense(id), { wrapper });

    await act(() =>
      result.current.mutateAsync({ title: "저녁", scope: { type: "one" } }),
    );

    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(String(url)).toBe(`/api/expenses/${id}`);
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({
      title: "저녁",
      scope: { type: "one" },
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.monthTotals],
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.expenseDetail],
    });
  });

  it("삭제는 DELETE로 범위를 보내고, 성공하면 지출 관련 조회를 무효화한다", async () => {
    const fetch = mockFetch({ deleted: 1 });
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDeleteExpense(id), { wrapper });

    await act(() => result.current.mutateAsync());

    const [, init] = fetch.mock.calls[0] ?? [];
    expect(init?.method).toBe("DELETE");
    expect(JSON.parse(String(init?.body))).toEqual({ scope: { type: "one" } });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.dayExpenses],
    });
  });
});
