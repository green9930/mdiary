import { describe, expect, it } from "vitest";

import {
  convertQuickPeriod,
  formatPeriodLabel,
  isPeriodWithinMax,
  matchQuickPeriod,
} from "@/lib/periodUtils";

describe("convertQuickPeriod (화면 명세 공통 정책값 · 최근 N개월)", () => {
  it("이번 달을 포함한 N개월", () => {
    expect(convertQuickPeriod(1, "2026-10")).toEqual({
      from: "2026-10",
      to: "2026-10",
    });
    expect(convertQuickPeriod(12, "2026-10")).toEqual({
      from: "2025-11",
      to: "2026-10",
    });
  });
});

describe("matchQuickPeriod", () => {
  it("빠른 선택과 같으면 그 개월 수, 아니면 null", () => {
    expect(
      matchQuickPeriod({ from: "2026-08", to: "2026-10" }, "2026-10"),
    ).toBe(3);
    expect(
      matchQuickPeriod({ from: "2026-10", to: "2026-10" }, "2026-10"),
    ).toBe(1);
    // 끝이 이번 달이 아니면 빠른 선택이 아니다
    expect(
      matchQuickPeriod({ from: "2026-07", to: "2026-09" }, "2026-10"),
    ).toBeNull();
    expect(
      matchQuickPeriod({ from: "2026-09", to: "2026-10" }, "2026-10"),
    ).toBeNull();
  });
});

describe("formatPeriodLabel (와이어프레임 SC-04 ①)", () => {
  it("빠른 선택과 같으면 그 이름", () => {
    expect(
      formatPeriodLabel({ from: "2026-10", to: "2026-10" }, "2026-10"),
    ).toBe("이번 달");
    expect(
      formatPeriodLabel({ from: "2026-05", to: "2026-10" }, "2026-10"),
    ).toBe("최근 6개월");
    expect(
      formatPeriodLabel({ from: "2025-11", to: "2026-10" }, "2026-10"),
    ).toBe("최근 1년");
  });

  it("직접 정한 기간이면 달 또는 기간", () => {
    expect(
      formatPeriodLabel({ from: "2026-11", to: "2026-11" }, "2026-10"),
    ).toBe("2026년 11월");
    expect(
      formatPeriodLabel({ from: "2025-03", to: "2026-02" }, "2026-10"),
    ).toBe("2025년 3월 ~ 2026년 2월");
  });
});

describe("isPeriodWithinMax (화면 명세 공통 정책값 · 카테고리별 조회 기간)", () => {
  it("시작 ≤ 끝이고 60개월까지", () => {
    expect(isPeriodWithinMax({ from: "2021-11", to: "2026-10" })).toBe(true);
    expect(isPeriodWithinMax({ from: "2021-10", to: "2026-10" })).toBe(false);
    expect(isPeriodWithinMax({ from: "2026-11", to: "2026-10" })).toBe(false);
  });
});
