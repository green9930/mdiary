import { describe, expect, it } from "vitest";

import { calendarPath, categoriesPath, newExpensePath } from "@/lib/navigation";

describe("calendarPath (화면 명세 SC-06 저장 성공)", () => {
  it("그 날짜의 월과 날짜를 담은 달력 주소다", () => {
    expect(calendarPath("2026-10-18")).toBe("/?month=2026-10&date=2026-10-18");
  });
});

describe("newExpensePath (화면 명세 SC-01 ＋ 버튼, SC-03 기록 추가하기)", () => {
  it("그 날짜로 여는 등록 화면 주소다", () => {
    expect(newExpensePath("2026-10-19")).toBe("/expenses/new?date=2026-10-19");
  });
});

describe("categoriesPath (화면 명세 SC-04 쿼리)", () => {
  const query = {
    from: "2025-11",
    to: "2026-10",
    category: null,
    sort: "latest",
  } as const;

  it("기간·정렬을 담고, 카테고리는 골랐을 때만 소문자로 담는다", () => {
    expect(categoriesPath(query)).toBe(
      "/categories?from=2025-11&to=2026-10&sort=latest",
    );
    expect(categoriesPath({ ...query, category: "FOOD", sort: "amount" })).toBe(
      "/categories?from=2025-11&to=2026-10&category=food&sort=amount",
    );
  });

  it("열린 상세 시트(expense)를 남긴다", () => {
    expect(categoriesPath(query, "e1")).toBe(
      "/categories?from=2025-11&to=2026-10&sort=latest&expense=e1",
    );
  });
});
