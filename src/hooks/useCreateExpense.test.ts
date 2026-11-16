// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useCreateExpense } from "@/hooks/useCreateExpense";
import { useTitleSuggestions } from "@/hooks/useTitleSuggestions";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

const request = {
  date: "2026-10-18",
  title: "점심",
  category: "FOOD" as const,
  amount: 8000,
  content: null,
  repeat: { type: "none" as const },
};

const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
};

afterEach(() => vi.restoreAllMocks());

describe("useCreateExpense (데이터 아키텍처 8-4)", () => {
  it("POST /api/expenses로 보내고 응답을 돌려준다", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        Response.json({ id: "e1", date: "2026-10-18" }, { status: 201 }),
      );
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    let created: unknown;
    await act(async () => {
      created = await result.current.mutateAsync(request);
    });

    expect(created).toEqual({ id: "e1", date: "2026-10-18" });
    expect(fetch).toHaveBeenCalledWith(
      "/api/expenses",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(request),
      }),
    );
  });

  it("성공하면 지출과 관련된 조회를 모두 무효화한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ id: "e1", date: "2026-10-18" }, { status: 201 }),
    );
    const { client, wrapper } = setup();
    const keys = [
      [QUERY_KEYS.accountSummary],
      [QUERY_KEYS.monthTotals, "2026-10"],
      [QUERY_KEYS.dayExpenses, "2026-10-18"],
      [QUERY_KEYS.categoryStats, "2026-01", "2026-10"],
      [QUERY_KEYS.categoryExpenses, "2026-01", "2026-10", null, "latest"],
      [QUERY_KEYS.searchResults, "점심", "all"],
      [QUERY_KEYS.titleSuggestions],
      [QUERY_KEYS.expenseDetail, "e0"],
    ];
    for (const key of keys) client.setQueryData(key, {});
    client.setQueryData(["unrelated"], {});
    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(request);
    });

    for (const key of keys) {
      expect(client.getQueryState(key)?.isInvalidated).toBe(true);
    }
    expect(client.getQueryState(["unrelated"])?.isInvalidated).toBe(false);
  });
});

describe("useTitleSuggestions", () => {
  it("GET /api/titles의 제목 목록을 돌려준다", async () => {
    const titles = [
      {
        title: "쿠팡",
        uses: 3,
        lastUsedAt: "2026-10-18T00:00:00.000Z",
        lastCategory: "LIVING",
      },
    ];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ titles }));
    const { wrapper } = setup();
    const { result } = renderHook(() => useTitleSuggestions(), { wrapper });

    await vi.waitFor(() => expect(result.current.data).toEqual(titles));
  });
});
