// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCategoriesQuery } from "@/hooks/useCategoriesQuery";

const navigation = { search: "" };
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const setup = (search: string) => {
  navigation.search = search;
  return renderHook(() => useCategoriesQuery("2026-10"));
};

beforeEach(() => {
  replace.mockReset();
});

describe("useCategoriesQuery (화면 명세 SC-04 쿼리, 공통 규약 상태를 URL에 둔다)", () => {
  it("쿼리가 없으면 이번 달 · 전체 · 최신순을 쓰고 주소는 그대로 둔다", () => {
    const { result } = setup("");
    expect(result.current.query).toEqual({
      from: "2026-10",
      to: "2026-10",
      category: null,
      sort: "latest",
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("잘못된 쿼리는 기본값으로 그리고 주소를 바꾼다. 열린 상세 시트는 남긴다", () => {
    const { result } = setup(
      "from=2026-11&to=2026-10&category=food&sort=amount&expense=e1",
    );
    expect(result.current.query).toMatchObject({
      from: "2026-10",
      to: "2026-10",
      category: "FOOD",
    });
    expect(replace).toHaveBeenCalledWith(
      "/categories?from=2026-10&to=2026-10&category=food&sort=amount&expense=e1",
      { scroll: false },
    );
  });

  it("올바른 쿼리면 주소를 바꾸지 않는다", () => {
    setup("from=2025-11&to=2026-10&category=food&sort=amount");
    expect(replace).not.toHaveBeenCalled();
  });

  it("기간을 바꾸면 카테고리·정렬은 유지한다 (기록을 쌓지 않음)", () => {
    const { result } = setup(
      "from=2026-10&to=2026-10&category=food&sort=amount",
    );
    act(() => result.current.setPeriod({ from: "2026-05", to: "2026-10" }));
    expect(replace).toHaveBeenCalledWith(
      "/categories?from=2026-05&to=2026-10&category=food&sort=amount",
      { scroll: false },
    );
  });

  it("카테고리를 바꾸거나 전체(null)로 돌린다", () => {
    const { result } = setup(
      "from=2026-10&to=2026-10&category=food&sort=latest",
    );
    act(() => result.current.setCategory(null));
    expect(replace).toHaveBeenLastCalledWith(
      "/categories?from=2026-10&to=2026-10&sort=latest",
      { scroll: false },
    );
    act(() => result.current.setCategory("LIVING"));
    expect(replace).toHaveBeenLastCalledWith(
      "/categories?from=2026-10&to=2026-10&category=living&sort=latest",
      { scroll: false },
    );
  });
});
