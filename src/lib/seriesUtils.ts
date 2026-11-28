import { formatAmount } from "@/lib/amount";
import { addMonths, formatMonth, lastDayOf, monthOf } from "@/lib/date";
import { SERIES_RULES } from "@/shared/expenseConstants";
import { isRepeatWithinMax } from "@/shared/expenseSchema";
import {
  DATE_RULES,
  REPEAT_PREVIEW_TEXTS,
  REPEAT_TEXTS,
  SERIES_TEXTS,
} from "@/shared/sharedConstants";
import type {
  ExpenseDetailSeriesType,
  ExpenseFormValues,
  InstallmentBasisType,
  RepeatType,
  SeriesKindType,
} from "@/types/expenseTypes";

// 반복 기록의 달·결제일·금액 계산 (데이터 아키텍처 5장).
// 서버의 행 생성과 등록 폼의 미리보기가 같은 함수를 쓴다

/** 그 달의 결제일. 그 달에 없는 날이면 말일 (공통 정책값 · 결제일이 없는 달) */
export const alignBillingDate = (month: string, billingDay: number) =>
  `${month}-${String(Math.min(billingDay, lastDayOf(month))).padStart(2, "0")}`;

/** from부터 to까지의 달 (둘 다 포함). from이 뒤면 빈 배열 */
export const listMonths = (from: string, to: string) => {
  const months: string[] = [];
  for (let month = from; month <= to; month = addMonths(month, 1))
    months.push(month);
  return months;
};

/** from부터 to까지의 개월 수 (둘 다 포함). from이 뒤면 0 */
export const countMonths = (from: string, to: string) => {
  const toIndex = (month: string) =>
    Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7));
  return Math.max(toIndex(to) - toIndex(from) + 1, 0);
};

/** 할부 회차 금액: 총액 기준이면 회차 금액은 버림, 끝전은 1회차에 (데이터 아키텍처 5-2) */
export const convertInstallmentAmounts = (
  amount: number,
  count: number,
  basis: InstallmentBasisType,
) => {
  if (basis === "perCount")
    return { first: amount, rest: amount, total: amount * count };
  const rest = Math.floor(amount / count);
  return { first: amount - rest * (count - 1), rest, total: amount };
};

const MAX_MONTH = monthOf(DATE_RULES.maxDate);

/** 계속 반복을 만들어 둘 끝 달: max(시작 달, 이번 달 + 24개월), 2099년 12월까지 */
export const convertExtendUntil = (startMonth: string, thisMonth: string) => {
  const target = addMonths(thisMonth, SERIES_RULES.extendMonths);
  const until = startMonth > target ? startMonth : target;
  return until > MAX_MONTH ? MAX_MONTH : until;
};

/** 묶음(Series)에 저장할 값. generatedUntil은 계속 반복만 (YYYY-MM) */
interface SeriesValues {
  type: SeriesKindType;
  billingDay: number;
  isContinuous: boolean;
  totalCount: number | null;
  installmentTotal: number | null;
  generatedUntil: string | null;
}

/** 묶음의 한 행 */
export interface SeriesRow {
  seq: number;
  date: string;
  amount: number;
}

/**
 * 반복 등록이 만드는 묶음과 행 (데이터 아키텍처 5-2). 반복 없음이면 null.
 * 첫 행은 입력한 날짜, 그 뒤는 매달 같은 일(없으면 말일)이다
 */
export const buildSeriesRows = (
  {
    date,
    amount,
    repeat,
  }: { date: string; amount: number; repeat: RepeatType },
  thisMonth: string,
): { series: SeriesValues; rows: SeriesRow[] } | null => {
  if (repeat.type === "none") return null;
  const start = monthOf(date);
  const billingDay = Number(date.slice(8, 10));
  const rowsOf = (count: number, amountOf: (seq: number) => number) =>
    listMonths(start, addMonths(start, count - 1)).map((month, index) => ({
      seq: index + 1,
      date: alignBillingDate(month, billingDay),
      amount: amountOf(index + 1),
    }));

  if (repeat.type === "installment") {
    const { first, rest, total } = convertInstallmentAmounts(
      amount,
      repeat.count,
      repeat.basis,
    );
    return {
      series: {
        type: "INSTALLMENT",
        billingDay,
        isContinuous: false,
        totalCount: repeat.count,
        installmentTotal: total,
        generatedUntil: null,
      },
      rows: rowsOf(repeat.count, (seq) => (seq === 1 ? first : rest)),
    };
  }

  const continuous = !("months" in repeat);
  const until = continuous ? convertExtendUntil(start, thisMonth) : null;
  const count =
    "months" in repeat ? repeat.months : countMonths(start, until ?? start);
  return {
    series: {
      type: "RECURRING",
      billingDay,
      isContinuous: continuous,
      totalCount: continuous ? null : count,
      installmentTotal: null,
      generatedUntil: until,
    },
    rows: rowsOf(count, () => amount),
  };
};

// 개월 수·회차 입력이 2~99이고 기간이 2099년 12월 안이면 그 수, 아니면 null
const validRepeatCount = (raw: string, date: string) => {
  const count = Number(raw);
  return raw &&
    count >= SERIES_RULES.repeatMin &&
    count <= SERIES_RULES.repeatMax &&
    isRepeatWithinMax(date, count)
    ? count
    : null;
};

const monthlyOn = (billingDay: number) => SERIES_TEXTS.monthlyOn(billingDay);

const rangeText = (from: string, to: string) =>
  REPEAT_PREVIEW_TEXTS.range(formatMonth(from), formatMonth(to));

// 할부 금액 줄: 금액이 없거나 총액 < 회차 수면 뺀다
const installmentAmountText = (values: ExpenseFormValues, count: number) => {
  const amount = Number(values.amount);
  if (!amount) return null;
  if (values.installmentBasis === "total" && amount < count) return null;
  const { first, rest } = convertInstallmentAmounts(
    amount,
    count,
    values.installmentBasis,
  );
  return first === rest
    ? REPEAT_PREVIEW_TEXTS.perCount(formatAmount(rest))
    : REPEAT_PREVIEW_TEXTS.firstAndRest(
        formatAmount(first),
        formatAmount(rest),
        count,
      );
};

/**
 * 등록 폼의 반복 미리보기 줄 (화면 명세 SC-06 반복 입력, 와이어프레임 ⑤⑥).
 * 개월 수·회차가 유효하지 않으면 비운다
 */
export const convertRepeatPreview = (values: ExpenseFormValues): string[] => {
  if (values.repeat === "none") return [];
  const billingDay = Number(values.date.slice(8, 10));
  const start = monthOf(values.date);
  const note =
    billingDay >= SERIES_RULES.lastDayNoteFrom
      ? [REPEAT_PREVIEW_TEXTS.lastDayNote]
      : [];

  if (values.repeat === "recurring") {
    if (values.recurringPeriod === "continuous")
      return [
        [monthlyOn(billingDay), REPEAT_TEXTS.continuous].join(" · "),
        ...note,
      ];
    const months = validRepeatCount(values.months, values.date);
    if (months === null) return [];
    return [
      [
        monthlyOn(billingDay),
        rangeText(start, addMonths(start, months - 1)),
      ].join(" · "),
      ...note,
    ];
  }

  const count = validRepeatCount(values.installmentCount, values.date);
  if (count === null) return [];
  const amountText = installmentAmountText(values, count);
  return [
    [monthlyOn(billingDay), rangeText(start, addMonths(start, count - 1))].join(
      " · ",
    ),
    ...(amountText ? [amountText] : []),
    ...note,
  ];
};

/** 수정 화면의 잠긴 반복 미리보기 (와이어프레임 SC-06 ⑦): 묶음의 결제일·기간 */
export const convertSeriesPreview = (
  series: ExpenseDetailSeriesType,
): string[] => {
  const day = monthlyOn(series.billingDay);
  if (series.isContinuous || series.totalCount === null)
    return [[day, REPEAT_TEXTS.continuous].join(" · ")];
  return [[day, rangeText(series.fromMonth, series.toMonth)].join(" · ")];
};
