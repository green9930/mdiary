import { describe, expect, it } from "vitest";

import { formatAmountInput } from "@/lib/amount";

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
