import { addMonths, countMonths, formatMonth } from "@/lib/date";
import { CATEGORY_PERIOD_RULES } from "@/shared/expenseConstants";
import { PERIOD_TEXTS } from "@/shared/sharedConstants";
import type { Period } from "@/types/expenseTypes";

// 조회 기간의 빠른 선택·라벨·한도 (화면 명세 SC-04·SC-05 기간)

/** 최근 N개월: 이번 달을 포함한 N개월 (화면 명세 공통 정책값) */
export const convertQuickPeriod = (
  months: number,
  thisMonth: string,
): Period => ({
  from: addMonths(thisMonth, -(months - 1)),
  to: thisMonth,
});

/** 빠른 선택과 같은 기간이면 그 개월 수, 아니면 null */
export const matchQuickPeriod = (period: Period, thisMonth: string) =>
  CATEGORY_PERIOD_RULES.quickMonths.find(
    (months) =>
      period.to === thisMonth &&
      period.from === convertQuickPeriod(months, thisMonth).from,
  ) ?? null;

/** 기간 라벨: 빠른 선택과 같으면 그 이름, 아니면 `2026년 11월` / `2025년 3월 ~ 2026년 2월` */
export const formatPeriodLabel = (period: Period, thisMonth: string) => {
  const quick = matchQuickPeriod(period, thisMonth);
  if (quick !== null) return PERIOD_TEXTS.quick[quick];
  return period.from === period.to
    ? formatMonth(period.from)
    : PERIOD_TEXTS.range(formatMonth(period.from), formatMonth(period.to));
};

/** 시작 ≤ 끝이고 최대 60개월인지 (화면 명세 공통 정책값 · 카테고리별 조회 기간) */
export const isPeriodWithinMax = ({ from, to }: Period) => {
  const months = countMonths(from, to);
  return months >= 1 && months <= CATEGORY_PERIOD_RULES.maxMonths;
};
