import { describe, expect, it } from "vitest";

import { filterTitleSuggestions } from "@/lib/titleSuggestionsUtils";
import type { TitleSuggestion } from "@/types/expenseTypes";

const suggestion = (title: string): TitleSuggestion => ({
  title,
  uses: 2,
  lastUsedAt: "2026-10-18T00:00:00.000Z",
  lastCategory: "LIVING",
});

const titles = (...names: string[]) => names.map(suggestion);

describe("filterTitleSuggestions (화면 명세 SC-06 자주 쓴 제목 추천)", () => {
  it("입력과 일치하는 제목을 받은 순서대로 고른다", () => {
    const result = filterTitleSuggestions(
      titles("쿠팡", "점심", "쿠팡이츠", "쿠키런"),
      "쿠",
    );
    expect(result.map((s) => s.title)).toEqual(["쿠팡", "쿠팡이츠", "쿠키런"]);
  });

  it("최대 5개까지 고른다", () => {
    const result = filterTitleSuggestions(
      titles("가1", "가2", "가3", "가4", "가5", "가6"),
      "가",
    );
    expect(result).toHaveLength(5);
  });

  it("입력이 비었거나 공백뿐이면 고르지 않는다", () => {
    expect(filterTitleSuggestions(titles("쿠팡"), "")).toEqual([]);
    expect(filterTitleSuggestions(titles("쿠팡"), "  ")).toEqual([]);
  });

  it("입력과 완전히 같은 제목 하나만 남으면 고르지 않는다", () => {
    expect(filterTitleSuggestions(titles("쿠팡", "점심"), "쿠팡")).toEqual([]);
  });

  it("같은 제목이 있어도 다른 제목이 함께 남으면 모두 고른다", () => {
    const result = filterTitleSuggestions(titles("쿠팡", "쿠팡이츠"), "쿠팡");
    expect(result.map((s) => s.title)).toEqual(["쿠팡", "쿠팡이츠"]);
  });
});
