import { formatAmount } from "@/lib/amount";
import { formatMonth } from "@/lib/date";
import { PERIOD_TEXTS, REPEAT_TEXTS } from "@/shared/sharedConstants";
import type { ExpenseDetailSeriesType } from "@/types/expenseTypes";

const convertFormatPeriod = (series: ExpenseDetailSeriesType) =>
  PERIOD_TEXTS.range(
    formatMonth(series.fromMonth),
    formatMonth(series.toMonth),
  );

/**
 * 상세의 반복 정보 줄 (화면 명세 SC-08, 와이어프레임 SC-08 ⑦).
 * 정기: `정기지출 · 매달 25일 · 반복` 또는 기간. 할부: `할부 2/3회 · 총 300,000원` + 기간 줄
 */
export const convertSeriesInfoText = (
  series: ExpenseDetailSeriesType,
): string[] => {
  if (series.type === "RECURRING") {
    const span = series.isContinuous
      ? REPEAT_TEXTS.continuousInfo
      : convertFormatPeriod(series);

    return [
      [
        REPEAT_TEXTS.recurring,
        REPEAT_TEXTS.monthlyOn(series.billingDay),
        span,
      ].join(" · "),
    ];
  }

  return [
    REPEAT_TEXTS.installmentInfo(
      series.seq,
      series.totalCount,
      formatAmount(series.installmentTotal ?? 0),
    ),
    convertFormatPeriod(series),
  ];
};
