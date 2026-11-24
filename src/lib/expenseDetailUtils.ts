import { formatAmount } from "@/lib/amount";
import { formatMonth } from "@/lib/date";
import { CATEGORY_LIST } from "@/shared/expenseConstants";
import { SERIES_TEXTS } from "@/shared/sharedConstants";
import type {
  CategoryType,
  ExpenseDetailSeriesType,
} from "@/types/expenseTypes";

/** 카테고리 이름 (`FOOD` → `식비`) */
export const convertCategoryLabel = (category: CategoryType) =>
  CATEGORY_LIST.find(({ value }) => value === category)?.label ?? category;

const convertFormatPeriod = (series: ExpenseDetailSeriesType) =>
  `${formatMonth(series.fromMonth)} ~ ${formatMonth(series.toMonth)}`;

/**
 * 상세의 반복 정보 줄 (화면 명세 SC-08, 와이어프레임 SC-08 ⑦).
 * 정기: `정기지출 · 매달 25일 · 반복` 또는 기간. 할부: `할부 2/3회 · 총 300,000원` + 기간 줄
 */
export const convertSeriesInfoText = (
  series: ExpenseDetailSeriesType,
): string[] => {
  if (series.type === "RECURRING") {
    const span = series.isContinuous
      ? SERIES_TEXTS.continuous
      : convertFormatPeriod(series);

    return [
      [
        SERIES_TEXTS.recurring,
        SERIES_TEXTS.monthlyOn(series.billingDay),
        span,
      ].join(" · "),
    ];
  }

  return [
    SERIES_TEXTS.installment(
      series.seq,
      series.totalCount,
      formatAmount(series.installmentTotal ?? 0),
    ),
    convertFormatPeriod(series),
  ];
};
