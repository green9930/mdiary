import { describe, expect, it } from "vitest";

import {
  alignBillingDate,
  buildSeriesRows,
  convertExtendUntil,
  convertInstallmentAmounts,
  convertRepeatPreview,
  convertSeriesPreview,
  listMonths,
} from "@/lib/seriesUtils";
import type {
  ExpenseDetailSeriesType,
  ExpenseFormValues,
} from "@/types/expenseTypes";

describe("alignBillingDate (공통 정책값 · 결제일이 없는 달)", () => {
  it("그 달에 결제일이 있으면 그 날", () => {
    expect(alignBillingDate("2026-10", 18)).toBe("2026-10-18");
    expect(alignBillingDate("2026-12", 31)).toBe("2026-12-31");
  });

  it("없으면 말일 (윤년 2월 29일)", () => {
    expect(alignBillingDate("2026-11", 31)).toBe("2026-11-30");
    expect(alignBillingDate("2027-02", 30)).toBe("2027-02-28");
    expect(alignBillingDate("2028-02", 31)).toBe("2028-02-29");
  });
});

describe("listMonths", () => {
  it("시작·끝 달을 포함해 순서대로", () => {
    expect(listMonths("2026-11", "2027-02")).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
    expect(listMonths("2026-11", "2026-11")).toEqual(["2026-11"]);
    expect(listMonths("2026-12", "2026-11")).toEqual([]);
  });
});

describe("convertInstallmentAmounts (데이터 아키텍처 5-2)", () => {
  it("회차당 금액이면 모두 같고 총액은 곱", () => {
    expect(convertInstallmentAmounts(13300, 3, "perCount")).toEqual({
      first: 13300,
      rest: 13300,
      total: 39900,
    });
  });

  it("총액이면 회차 금액은 버림, 끝전은 1회차에", () => {
    expect(convertInstallmentAmounts(100000, 3, "total")).toEqual({
      first: 33334,
      rest: 33333,
      total: 100000,
    });
    expect(convertInstallmentAmounts(300000, 3, "total")).toEqual({
      first: 100000,
      rest: 100000,
      total: 300000,
    });
  });
});

describe("convertExtendUntil (데이터 아키텍처 5-2 연장 끝 달)", () => {
  it("max(날짜의 달, 이번 달 + 24개월)", () => {
    expect(convertExtendUntil("2026-10", "2026-11")).toBe("2028-11");
    expect(convertExtendUntil("2030-01", "2026-11")).toBe("2030-01");
  });

  it("2099년 12월을 넘지 않는다", () => {
    expect(convertExtendUntil("2099-01", "2098-06")).toBe("2099-12");
  });
});

describe("buildSeriesRows (데이터 아키텍처 5-2)", () => {
  const base = { date: "2026-10-31", amount: 100000 };

  it("반복 없음이면 null", () => {
    expect(
      buildSeriesRows({ ...base, repeat: { type: "none" } }, "2026-10"),
    ).toBeNull();
  });

  it("정기 N개월: 날짜의 달부터 N개 달, 결제일은 말일 맞추기", () => {
    const built = buildSeriesRows(
      { ...base, repeat: { type: "recurring", months: 3 } },
      "2026-10",
    );
    expect(built?.series).toEqual({
      type: "RECURRING",
      billingDay: 31,
      isContinuous: false,
      totalCount: 3,
      installmentTotal: null,
      generatedUntil: null,
    });
    expect(built?.rows).toEqual([
      { seq: 1, date: "2026-10-31", amount: 100000 },
      { seq: 2, date: "2026-11-30", amount: 100000 },
      { seq: 3, date: "2026-12-31", amount: 100000 },
    ]);
  });

  it("정기 계속: 연장 끝 달까지 만들고 generatedUntil에 둔다", () => {
    const built = buildSeriesRows(
      { ...base, repeat: { type: "recurring", continuous: true } },
      "2026-10",
    );
    expect(built?.series).toMatchObject({
      isContinuous: true,
      totalCount: null,
      generatedUntil: "2028-10",
    });
    expect(built?.rows).toHaveLength(25);
    expect(built?.rows.at(-1)).toEqual({
      seq: 25,
      date: "2028-10-31",
      amount: 100000,
    });
  });

  it("할부 총액: 1회차에 끝전, 총액을 고정 저장", () => {
    const built = buildSeriesRows(
      { ...base, repeat: { type: "installment", count: 3, basis: "total" } },
      "2026-10",
    );
    expect(built?.series).toEqual({
      type: "INSTALLMENT",
      billingDay: 31,
      isContinuous: false,
      totalCount: 3,
      installmentTotal: 100000,
      generatedUntil: null,
    });
    expect(built?.rows.map(({ date, amount }) => [date, amount])).toEqual([
      ["2026-10-31", 33334],
      ["2026-11-30", 33333],
      ["2026-12-31", 33333],
    ]);
  });

  it("할부 회차당 금액: 모두 같은 금액, 총액은 곱", () => {
    const built = buildSeriesRows(
      {
        date: "2026-11-01",
        amount: 100000,
        repeat: { type: "installment", count: 2, basis: "perCount" },
      },
      "2026-10",
    );
    expect(built?.series.installmentTotal).toBe(200000);
    expect(built?.rows.map(({ amount }) => amount)).toEqual([100000, 100000]);
  });
});

const formValues = (
  overrides: Partial<ExpenseFormValues>,
): ExpenseFormValues => ({
  date: "2026-10-31",
  title: "",
  category: null,
  amount: "",
  content: "",
  repeat: "none",
  recurringPeriod: "continuous",
  months: "",
  installmentBasis: "perCount",
  installmentCount: "",
  ...overrides,
});

describe("convertRepeatPreview (와이어프레임 SC-06 ⑤⑥ 미리보기)", () => {
  it("반복 없음이면 비운다", () => {
    expect(convertRepeatPreview(formValues({}))).toEqual([]);
  });

  it("정기 계속: 결제일 · 계속, 29~31일이면 말일 안내", () => {
    expect(convertRepeatPreview(formValues({ repeat: "recurring" }))).toEqual([
      "매달 31일 · 계속",
      "없는 달은 말일로 기록됩니다.",
    ]);
    expect(
      convertRepeatPreview(
        formValues({ date: "2026-10-28", repeat: "recurring" }),
      ),
    ).toEqual(["매달 28일 · 계속"]);
  });

  it("정기 N개월: 기간. 개월 수가 유효하지 않으면 비운다", () => {
    const values = formValues({
      date: "2026-10-18",
      repeat: "recurring",
      recurringPeriod: "months",
    });
    expect(convertRepeatPreview({ ...values, months: "6" })).toEqual([
      "매달 18일 · 2026년 10월 ~ 2027년 3월",
    ]);
    expect(convertRepeatPreview({ ...values, months: "" })).toEqual([]);
    expect(convertRepeatPreview({ ...values, months: "1" })).toEqual([]);
    expect(
      convertRepeatPreview({ ...values, date: "2099-10-18", months: "6" }),
    ).toEqual([]);
  });

  it("할부: 기간 + 회차당 금액", () => {
    const values = formValues({
      date: "2026-11-01",
      repeat: "installment",
      installmentCount: "3",
    });
    expect(convertRepeatPreview({ ...values, amount: "13300" })).toEqual([
      "매달 1일 · 2026년 11월 ~ 2027년 1월",
      "회차당 13,300원",
    ]);
    // 금액이 비어 있으면 금액 줄을 뺀다
    expect(convertRepeatPreview(values)).toEqual([
      "매달 1일 · 2026년 11월 ~ 2027년 1월",
    ]);
  });

  it("할부 총액: 끝전이 있으면 1회차를 따로, 나누어떨어지면 회차당만", () => {
    const values = formValues({
      date: "2026-11-01",
      repeat: "installment",
      installmentBasis: "total",
      installmentCount: "3",
    });
    expect(convertRepeatPreview({ ...values, amount: "100000" })[1]).toBe(
      "1회차 33,334원 · 2~3회차 33,333원",
    );
    expect(convertRepeatPreview({ ...values, amount: "300000" })[1]).toBe(
      "회차당 100,000원",
    );
    expect(
      convertRepeatPreview({
        ...values,
        amount: "100001",
        installmentCount: "2",
      })[1],
    ).toBe("1회차 50,001원 · 2회차 50,000원");
    // 총액 < 회차 수면 금액 줄을 뺀다
    expect(convertRepeatPreview({ ...values, amount: "2" })).toHaveLength(1);
  });
});

describe("convertSeriesPreview (수정 화면의 잠긴 반복 미리보기)", () => {
  const series: ExpenseDetailSeriesType = {
    type: "RECURRING",
    seq: 2,
    totalCount: null,
    billingDay: 25,
    isContinuous: true,
    installmentTotal: null,
    fromMonth: "2026-10",
    toMonth: "2028-10",
  };

  it("정기 계속: 결제일 · 계속", () => {
    expect(convertSeriesPreview(series)).toEqual(["매달 25일 · 계속"]);
  });

  it("정기 N개월·할부: 기간", () => {
    expect(
      convertSeriesPreview({
        ...series,
        isContinuous: false,
        totalCount: 6,
        toMonth: "2027-03",
      }),
    ).toEqual(["매달 25일 · 2026년 10월 ~ 2027년 3월"]);
    expect(
      convertSeriesPreview({
        ...series,
        type: "INSTALLMENT",
        isContinuous: false,
        totalCount: 3,
        installmentTotal: 300000,
        toMonth: "2026-12",
      }),
    ).toEqual(["매달 25일 · 2026년 10월 ~ 2026년 12월"]);
  });
});
