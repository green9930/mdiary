import { describe, expect, it } from "vitest";

import {
  convertCategoryLabel,
  convertCategorySlug,
  convertShare,
  resolveCategoriesQuery,
} from "@/lib/categoriesUtils";

const empty = { from: null, to: null, category: null, sort: null };

describe("resolveCategoriesQuery (화면 명세 SC-04 규칙)", () => {
  it("쿼리가 없으면 이번 달 · 전체 · 최신순", () => {
    expect(resolveCategoriesQuery(empty, "2026-10")).toEqual({
      from: "2026-10",
      to: "2026-10",
      category: null,
      sort: "latest",
    });
  });

  it("올바른 값은 그대로", () => {
    expect(
      resolveCategoriesQuery(
        { from: "2025-03", to: "2026-02", category: "food", sort: "amount" },
        "2026-10",
      ),
    ).toEqual({
      from: "2025-03",
      to: "2026-02",
      category: "FOOD",
      sort: "amount",
    });
  });

  it("기간은 시작·끝을 한 쌍으로 본다: 하나라도 틀리면 둘 다 이번 달", () => {
    const resolve = (from: string | null, to: string | null) =>
      resolveCategoriesQuery({ ...empty, from, to }, "2026-10");
    const thisMonth = { from: "2026-10", to: "2026-10" };
    expect(resolve("2026-11", "2026-10")).toMatchObject(thisMonth); // 시작 > 끝
    expect(resolve("2021-10", "2026-10")).toMatchObject(thisMonth); // 61개월
    expect(resolve("2026-13", "2026-12")).toMatchObject(thisMonth); // 없는 달
    expect(resolve("2019-12", "2020-01")).toMatchObject(thisMonth); // 선택 가능 연도 밖
    expect(resolve("2026-01", null)).toMatchObject(thisMonth); // 한쪽만
  });

  it("필드마다 따로 고친다: 잘못된 카테고리·정렬만 기본값", () => {
    expect(
      resolveCategoriesQuery(
        { from: "2026-01", to: "2026-03", category: "FOOD", sort: "price" },
        "2026-10",
      ),
    ).toEqual({
      from: "2026-01",
      to: "2026-03",
      category: null,
      sort: "latest",
    });
  });
});

describe("convertCategoryLabel", () => {
  it("카테고리 이름", () => {
    expect(convertCategoryLabel("FOOD")).toBe("식비");
    expect(convertCategoryLabel("ETC")).toBe("기타");
  });
});

describe("convertCategorySlug", () => {
  it("카테고리 값의 소문자", () => {
    expect(convertCategorySlug("APPLIANCE")).toBe("appliance");
  });
});

describe("convertShare (화면 명세 SC-04 비중)", () => {
  it("소수 첫째 자리 %", () => {
    expect(convertShare(519700, 1234500)).toEqual({
      text: "42.1%",
      percent: (519700 / 1234500) * 100,
    });
    expect(convertShare(1, 1).text).toBe("100.0%");
  });

  it("0.1% 미만은 <0.1%", () => {
    expect(convertShare(900, 1234500).text).toBe("<0.1%");
    expect(convertShare(1, 1000).text).toBe("0.1%");
  });
});
