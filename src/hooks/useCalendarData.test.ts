// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAccountSummary } from "@/hooks/useAccountSummary";
import { useDayExpenses } from "@/hooks/useDayExpenses";
import { useCachedMonthTotals, useMonthTotals } from "@/hooks/useMonthTotals";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

// app: 앱과 같은 기본값(이전 데이터 유지 등)을 쓴다
const setup = ({ app = false } = {}) => {
  const client = app
    ? createQueryClient({ onUnauthorized: () => {} })
    : new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return { client, wrapper };
};

// 주소별로 응답을 돌려주는 가짜 fetch
const mockFetch = (responses: Record<string, unknown>) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    return url in responses
      ? Response.json(responses[url])
      : Response.json({ code: "NOT_FOUND" }, { status: 404 });
  });

afterEach(() => vi.restoreAllMocks());

const totals = (total: number) => ({ total, days: [] });

describe("useMonthTotals (데이터 아키텍처 8-4 monthTotals)", () => {
  it("GET /api/calendar?month=의 합계를 돌려준다", async () => {
    mockFetch({ "/api/calendar?month=2026-10": totals(1000) });
    const { wrapper } = setup();
    const { result } = renderHook(() => useMonthTotals("2026-10"), {
      wrapper,
    });

    await vi.waitFor(() => expect(result.current.data).toEqual(totals(1000)));
  });

  it("앞뒤 달을 미리 불러온다 (스와이프 중 옆 달 금액)", async () => {
    mockFetch({
      "/api/calendar?month=2026-10": totals(1),
      "/api/calendar?month=2026-09": totals(2),
      "/api/calendar?month=2026-11": totals(3),
    });
    const { client, wrapper } = setup();
    renderHook(() => useMonthTotals("2026-10"), { wrapper });

    await vi.waitFor(() => {
      expect(client.getQueryData([QUERY_KEYS.monthTotals, "2026-09"])).toEqual(
        totals(2),
      );
      expect(client.getQueryData([QUERY_KEYS.monthTotals, "2026-11"])).toEqual(
        totals(3),
      );
    });
  });

  it("달을 바꾸면 이전 달 데이터를 보여주지 않는다 (SC-03 월 이동 중)", async () => {
    mockFetch({ "/api/calendar?month=2026-10": totals(1) });
    const { wrapper } = setup({ app: true });
    const { result, rerender } = renderHook(
      ({ month }) => useMonthTotals(month),
      { wrapper, initialProps: { month: "2026-10" } },
    );
    await vi.waitFor(() => expect(result.current.data).toEqual(totals(1)));

    rerender({ month: "2025-01" });

    expect(result.current.data).toBeUndefined();
  });

  it("옆 달로 옮기면 미리 불러온 합계를 쓰고 다시 요청하지 않는다", async () => {
    const fetchSpy = mockFetch({
      "/api/calendar?month=2026-09": totals(1),
      "/api/calendar?month=2026-10": totals(2),
      "/api/calendar?month=2026-11": totals(3),
      "/api/calendar?month=2026-12": totals(4),
    });
    const { client, wrapper } = setup({ app: true });
    const { result, rerender } = renderHook(
      ({ month }) => useMonthTotals(month),
      { wrapper, initialProps: { month: "2026-10" } },
    );
    await vi.waitFor(() =>
      expect(
        client.getQueryData([QUERY_KEYS.monthTotals, "2026-11"]),
      ).toBeDefined(),
    );

    rerender({ month: "2026-11" });
    expect(result.current.data).toEqual(totals(3));
    await vi.waitFor(() =>
      expect(
        client.getQueryData([QUERY_KEYS.monthTotals, "2026-12"]),
      ).toBeDefined(),
    );

    const requested = fetchSpy.mock.calls.map(([input]) => String(input));
    expect(requested.filter((url) => url.endsWith("2026-10"))).toHaveLength(1);
    expect(requested.filter((url) => url.endsWith("2026-11"))).toHaveLength(1);
  });

  it("무효화하면 (등록 등) 다시 불러온다", async () => {
    const fetchSpy = mockFetch({ "/api/calendar?month=2026-10": totals(1) });
    const { client, wrapper } = setup({ app: true });
    const { result } = renderHook(() => useMonthTotals("2026-10"), {
      wrapper,
    });
    await vi.waitFor(() => expect(result.current.data).toEqual(totals(1)));
    fetchSpy.mockClear();

    await act(() =>
      client.invalidateQueries({ queryKey: [QUERY_KEYS.monthTotals] }),
    );

    const requested = fetchSpy.mock.calls.map(([input]) => String(input));
    expect(requested).toContain("/api/calendar?month=2026-10");
  });
});

describe("useCachedMonthTotals (스와이프 중 옆 달)", () => {
  it("불러온 달의 합계를 읽고 새로 요청하지 않는다", async () => {
    const fetch = mockFetch({});
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useCachedMonthTotals("2026-09"), {
      wrapper,
    });
    expect(result.current).toBeUndefined();

    act(() => {
      client.setQueryData([QUERY_KEYS.monthTotals, "2026-09"], totals(5));
    });

    await vi.waitFor(() => expect(result.current).toEqual(totals(5)));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("useDayExpenses (데이터 아키텍처 8-4 dayExpenses)", () => {
  it("GET /api/expenses?date=의 목록을 돌려준다", async () => {
    const items = [{ id: "e1" }];
    mockFetch({ "/api/expenses?date=2026-10-18": { items } });
    const { wrapper } = setup();
    const { result } = renderHook(() => useDayExpenses("2026-10-18"), {
      wrapper,
    });

    await vi.waitFor(() => expect(result.current.data).toEqual(items));
  });
});

describe("useAccountSummary (데이터 아키텍처 8-4 accountSummary)", () => {
  it("GET /api/me의 계정 요약을 돌려준다", async () => {
    const summary = { email: "a@b.c", totalCount: 3 };
    mockFetch({ "/api/me": summary });
    const { wrapper } = setup();
    const { result } = renderHook(() => useAccountSummary(), { wrapper });

    await vi.waitFor(() => expect(result.current.data).toEqual(summary));
  });
});
