// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useExpenseSheetQuery } from "@/hooks/useExpenseSheetQuery";

const navigation = { search: "" };
const router = { push: vi.fn(), back: vi.fn(), replace: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const setup = (search: string) => {
  navigation.search = search;
  const hook = renderHook(() => useExpenseSheetQuery());
  // 주소가 바뀐 것처럼 다시 그린다
  const navigate = (next: string) => {
    navigation.search = next;
    hook.rerender();
  };
  return { ...hook, navigate };
};

beforeEach(() => {
  router.push.mockReset();
  router.back.mockReset();
  router.replace.mockReset();
});

describe("useExpenseSheetQuery (화면 명세 SC-08, 공통 규약 상태를 URL에 둔다)", () => {
  it("쿼리 expense가 열린 기록이다", () => {
    expect(setup("month=2026-10&expense=e1").result.current.expenseId).toBe(
      "e1",
    );
    expect(setup("month=2026-10").result.current.expenseId).toBeNull();
  });

  it("열 때는 다른 쿼리를 둔 채 기록을 쌓는다(push)", () => {
    const { result } = setup("month=2026-10&date=2026-10-18");

    act(() => result.current.open("e1"));

    expect(router.push).toHaveBeenCalledWith(
      "/?month=2026-10&date=2026-10-18&expense=e1",
      { scroll: false },
    );
  });

  it("앱 안에서 열었으면 뒤로 가기로 닫는다", () => {
    const { result, navigate } = setup("month=2026-10");
    act(() => result.current.open("e1"));
    navigate("month=2026-10&expense=e1");

    act(() => result.current.close());

    expect(router.back).toHaveBeenCalledOnce();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("주소로 열렸으면(새로고침) 기록을 쌓지 않고 쿼리만 지운다", () => {
    const { result } = setup("month=2026-10&expense=e1");

    act(() => result.current.close());

    expect(router.replace).toHaveBeenCalledWith("/?month=2026-10", {
      scroll: false,
    });
    expect(router.back).not.toHaveBeenCalled();
  });

  it("handleAfterClose는 시트가 닫힌 주소가 된 뒤에 실행한다 ([수정])", () => {
    const { result, navigate } = setup("month=2026-10");
    act(() => result.current.open("e1"));
    navigate("month=2026-10&expense=e1");
    const next = vi.fn();

    act(() => result.current.handleAfterClose(next));
    expect(next).not.toHaveBeenCalled();
    navigate("month=2026-10");

    expect(next).toHaveBeenCalledOnce();
  });
});
