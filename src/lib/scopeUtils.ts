import { formatLongDate, formatMonth, monthDiff } from "@/lib/date";
import { SERIES_RULES } from "@/shared/expenseConstants";
import {
  FIELD_ERRORS,
  PERIOD_TEXTS,
  REPEAT_TEXTS,
} from "@/shared/sharedConstants";
import type { ScopePreview, ScopeType } from "@/types/expenseTypes";

// 반복 기록 범위 선택 (화면 명세 SC-09, 데이터 아키텍처 5-3·5-6)

/**
 * 수정에서 날짜를 바꿨을 때 고를 수 있는 범위와 라디오 아래 안내 (D11).
 * 이번 건만은 늘 고를 수 있다. 뒤 달: 이 건부터 N개월 막음. 앞 달: 이번 건만
 */
export const convertScopeOptions = (originalDate: string, date: string) => {
  const delta = monthDiff(originalDate, date);
  if (delta > 0)
    return {
      after: true,
      count: false,
      hint: REPEAT_TEXTS.scopeLaterMonthHint,
    };
  if (delta < 0)
    return {
      after: false,
      count: false,
      hint: REPEAT_TEXTS.scopeEarlierMonthHint,
    };
  return { after: true, count: true, hint: null };
};

/** 이 건부터 N개월의 N 오류. remaining이 null이면 계속 반복이라 99까지 */
export const validateScopeCount = (raw: string, remaining: number | null) => {
  if (!raw) return FIELD_ERRORS.monthsRequired;
  const max = remaining ?? SERIES_RULES.repeatMax;
  return Number(raw) > max ? FIELD_ERRORS.scopeCountMax(max) : undefined;
};

/**
 * 범위 미리보기 문구 (와이어프레임 SC-09 ④⑪).
 * date는 이번 건만에 보여 줄 날짜(수정은 바꾼 날짜), dateChanged는 수정에서 날짜를 바꿨는지
 */
export const convertScopePreviewText = ({
  scope,
  preview,
  date,
  dateChanged,
}: {
  scope: ScopeType;
  preview: ScopePreview;
  date: string;
  dateChanged: boolean;
}) => {
  const { affected } = preview;
  if (scope.type === "one")
    return REPEAT_TEXTS.scopeOneDay(formatLongDate(date), 1);
  const from = formatMonth(affected.fromMonth);
  if (
    affected.continuous ||
    affected.toMonth === null ||
    affected.count === null
  )
    return dateChanged
      ? REPEAT_TEXTS.scopeFromContinuousOn(from, Number(date.slice(8, 10)))
      : REPEAT_TEXTS.scopeFromContinuous(from);
  return REPEAT_TEXTS.scopeRangeCount(
    PERIOD_TEXTS.range(from, formatMonth(affected.toMonth)),
    affected.count,
  );
};
