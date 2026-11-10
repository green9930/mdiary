// @vitest-environment jsdom
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createQueryClient } from "@/lib/queryClient";
import { getQueryView } from "@/lib/queryView";

// 앱과 같은 기본값에 재시도만 끈다
const makeWrapper = () => {
  const client: QueryClient = createQueryClient();
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return Wrapper;
};

// 조건(month)별 응답. fail에 넣은 조건은 실패한다.
// 화면처럼 그리는 중에 getQueryView를 부른다 (TanStack Query는 그리는 중에 읽은 값이 바뀔 때만 다시 그린다)
const useMonth = (month: number, fail: Set<number>) => {
  const query = useQuery({
    queryKey: ["month", month],
    queryFn: async () => {
      if (fail.has(month)) throw new Error("fail");
      return `${month}월`;
    },
  });
  return { query, state: getQueryView(query) };
};

describe("getQueryView (CM ①~③)", () => {
  it("첫 로딩은 스켈레톤, 성공하면 데이터", async () => {
    const { result } = renderHook(() => useMonth(10, new Set()), {
      wrapper: makeWrapper(),
    });
    expect(result.current.state).toEqual({
      view: "skeleton",
      refreshFailed: false,
    });
    await waitFor(() =>
      expect(result.current.state).toEqual({
        view: "data",
        refreshFailed: false,
      }),
    );
  });

  it("첫 조회가 실패하면 조회 실패(②)", async () => {
    const { result } = renderHook(() => useMonth(10, new Set([10])), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.state.view).toBe("loadError"));
  });

  it("조건을 바꾸면 불러오는 동안 이전 데이터를 보여주고, 실패하면 조회 실패(②)", async () => {
    const fail = new Set([11]);
    const { result, rerender } = renderHook(
      ({ month }) => useMonth(month, fail),
      { wrapper: makeWrapper(), initialProps: { month: 10 } },
    );
    await waitFor(() => expect(result.current.query.data).toBe("10월"));

    rerender({ month: 11 });
    expect(result.current.query.data).toBe("10월");
    expect(result.current.state.view).toBe("data");

    await waitFor(() =>
      expect(result.current.state).toEqual({
        view: "loadError",
        refreshFailed: false,
      }),
    );
    expect(result.current.query.data).toBeUndefined();
  });

  it("같은 조건으로 다시 불러오다 실패하면 데이터는 두고 띠(③)", async () => {
    const fail = new Set<number>();
    const { result } = renderHook(() => useMonth(10, fail), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.query.data).toBe("10월"));

    fail.add(10);
    await act(() => result.current.query.refetch());
    await waitFor(() =>
      expect(result.current.state).toEqual({
        view: "data",
        refreshFailed: true,
      }),
    );
    expect(result.current.query.data).toBe("10월");

    // 다시 시도가 성공하면 띠가 사라진다
    fail.delete(10);
    await act(() => result.current.query.refetch());
    await waitFor(() => expect(result.current.state.refreshFailed).toBe(false));
  });

  it("무한 스크롤 다음 장 실패(④)는 띠로 보지 않는다", async () => {
    const { result } = renderHook(
      () => {
        const query = useInfiniteQuery({
          queryKey: ["list"],
          initialPageParam: 0,
          queryFn: async ({ pageParam }) => {
            if (pageParam > 0) throw new Error("fail");
            return [pageParam];
          },
          getNextPageParam: (_last, pages) => pages.length,
        });
        return { query, state: getQueryView(query) };
      },
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.query.data).toBeDefined());

    await act(() => result.current.query.fetchNextPage());
    await waitFor(() =>
      expect(result.current.query.isFetchNextPageError).toBe(true),
    );
    expect(result.current.state).toEqual({
      view: "data",
      refreshFailed: false,
    });
  });
});
