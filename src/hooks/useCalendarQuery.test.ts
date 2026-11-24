// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCalendarQuery } from "@/hooks/useCalendarQuery";

const navigation = { search: "" };
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const today = "2026-11-17";

const setup = (search: string) => {
  navigation.search = search;
  return renderHook(() => useCalendarQuery(today));
};

beforeEach(() => {
  replace.mockReset();
});

describe("useCalendarQuery (화면 명세 SC-03 쿼리, 공통 규약 상태를 URL에 둔다)", () => {
  it("쿼리가 없으면 이번 달·오늘을 쓰고 주소는 그대로 둔다", () => {
    const { result } = setup("");
    expect(result.current).toMatchObject({
      month: "2026-11",
      date: "2026-11-17",
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("쿼리 값을 쓴다", () => {
    const { result } = setup("month=2026-08&date=2026-08-12");
    expect(result.current).toMatchObject({
      month: "2026-08",
      date: "2026-08-12",
    });
  });

  it("잘못된 쿼리는 기본값으로 그리고 주소를 바꾼다 (기록을 쌓지 않음)", () => {
    const { result } = setup("month=2026-13&date=2026-08-12");
    expect(result.current.month).toBe("2026-11");
    expect(replace).toHaveBeenCalledWith("/?month=2026-11&date=2026-11-17", {
      scroll: false,
    });
  });

  it("선택 가능 연도(2020년)보다 앞선 달은 기본값으로 바꾼다", () => {
    setup("month=2019-05&date=2019-05-01");
    expect(replace).toHaveBeenCalledWith("/?month=2026-11&date=2026-11-17", {
      scroll: false,
    });
  });

  it("날짜를 고르면 주소의 date를 바꾼다", () => {
    const { result } = setup("month=2026-08&date=2026-08-12");
    act(() => result.current.selectDate("2026-08-20"));
    expect(replace).toHaveBeenCalledWith("/?month=2026-08&date=2026-08-20", {
      scroll: false,
    });
  });

  it("앞뒤 달 날짜를 고르면 그 달로 옮겨 그 날짜를 고른다", () => {
    const { result } = setup("month=2026-08&date=2026-08-12");
    act(() => result.current.selectDate("2026-09-02"));
    expect(replace).toHaveBeenCalledWith("/?month=2026-09&date=2026-09-02", {
      scroll: false,
    });
  });

  it("다른 달로 옮기면 1일, 이번 달이면 오늘을 고른다", () => {
    const { result } = setup("month=2026-08&date=2026-08-12");
    act(() => result.current.moveToMonth("2026-07"));
    expect(replace).toHaveBeenLastCalledWith(
      "/?month=2026-07&date=2026-07-01",
      { scroll: false },
    );
    act(() => result.current.moveToMonth("2026-11"));
    expect(replace).toHaveBeenLastCalledWith(
      "/?month=2026-11&date=2026-11-17",
      { scroll: false },
    );
  });
});
