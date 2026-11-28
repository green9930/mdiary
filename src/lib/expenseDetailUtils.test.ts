import { describe, expect, it } from "vitest";

import { convertSeriesInfoText } from "@/lib/expenseDetailUtils";
import type { ExpenseDetailSeriesType } from "@/types/expenseTypes";

const recurring: ExpenseDetailSeriesType = {
  type: "RECURRING",
  seq: 2,
  totalCount: null,
  billingDay: 25,
  isContinuous: true,
  installmentTotal: null,
  fromMonth: "2026-11",
  toMonth: "2027-01",
};

describe("convertSeriesInfoText (화면 명세 SC-08 반복 정보)", () => {
  it("계속 반복하는 정기지출: 결제일과 반복", () => {
    expect(convertSeriesInfoText(recurring)).toEqual([
      "정기지출 · 매달 25일 · 반복",
    ]);
  });

  it("기간을 정한 정기지출: 결제일과 기간", () => {
    expect(
      convertSeriesInfoText({
        ...recurring,
        isContinuous: false,
        totalCount: 6,
        fromMonth: "2026-10",
        toMonth: "2027-03",
      }),
    ).toEqual(["정기지출 · 매달 25일 · 2026년 10월 ~ 2027년 3월"]);
  });

  it("할부: 회차·총액, 다음 줄에 기간", () => {
    expect(
      convertSeriesInfoText({
        type: "INSTALLMENT",
        seq: 2,
        totalCount: 3,
        billingDay: 1,
        isContinuous: false,
        installmentTotal: 300_000,
        fromMonth: "2026-11",
        toMonth: "2027-01",
      }),
    ).toEqual(["할부 2/3회 · 총 300,000원", "2026년 11월 ~ 2027년 1월"]);
  });
});
