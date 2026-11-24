import { describe, expect, it } from "vitest";

import {
  formatAmount,
  formatAmountInput,
  formatCalendarAmount,
} from "@/lib/amount";

describe("formatAmountInput (화면 명세 SC-06 금액: 입력 중 쉼표)", () => {
  it("숫자 문자열에 천 단위 쉼표를 넣는다", () => {
    expect(formatAmountInput("8000")).toBe("8,000");
    expect(formatAmountInput("999999999")).toBe("999,999,999");
    expect(formatAmountInput("12")).toBe("12");
  });

  it("비어 있으면 빈 문자열이다", () => {
    expect(formatAmountInput("")).toBe("");
  });
});

describe("formatAmount (화면 명세 공통 정책값 · 금액 표시)", () => {
  it("천 단위 쉼표와 원을 붙인다", () => {
    expect(formatAmount(12300)).toBe("12,300원");
    expect(formatAmount(0)).toBe("0원");
  });
});

describe("formatCalendarAmount (화면 명세 공통 정책값 · 달력 칸 축약 표시)", () => {
  it("6자리까지는 전체 금액을 쉼표로 보여준다", () => {
    expect(formatCalendarAmount(8000)).toBe("8,000");
    expect(formatCalendarAmount(999_999)).toBe("999,999");
  });

  it("7자리부터 만 단위로 줄이고 소수 첫째 자리에서 버린다", () => {
    expect(formatCalendarAmount(1_000_000)).toBe("100만");
    expect(formatCalendarAmount(1_234_567)).toBe("123.4만");
    expect(formatCalendarAmount(12_345_678)).toBe("1234.5만");
    expect(formatCalendarAmount(99_999_999)).toBe("9999.9만");
  });

  it("소수가 0이면 생략한다", () => {
    expect(formatCalendarAmount(1_080_000)).toBe("108만");
  });

  it("1억부터 억 단위로 줄인다", () => {
    expect(formatCalendarAmount(100_000_000)).toBe("1억");
    expect(formatCalendarAmount(123_456_789)).toBe("1.2억");
    expect(formatCalendarAmount(999_999_999)).toBe("9.9억");
  });
});
