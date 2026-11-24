import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { defaultDateOf } from "@/lib/date";
import { calendarPath } from "@/lib/navigation";
import { resolveCalendarQuery } from "@/lib/resolveCalendarQuery";
import { URL_PARAMS } from "@/shared/sharedConstants";

/**
 * 달력의 월·선택 날짜를 URL 쿼리로 다룬다 (화면 명세 SC-03, 공통 규약 상태를 URL에 둔다).
 * 바꿀 때는 기록을 쌓지 않는다(replace). 잘못된 쿼리는 기본값으로 그리고 주소도 바꾼다
 */
export const useCalendarQuery = (today: string) => {
  const router = useRouter();
  const params = useSearchParams();
  const rawMonth = params.get("month");
  const rawDate = params.get("date");
  const { month, date } = resolveCalendarQuery(
    { month: rawMonth, date: rawDate },
    today,
  );
  const hasQuery = rawMonth !== null || rawDate !== null;
  const needsReplace = hasQuery && (rawMonth !== month || rawDate !== date);
  // 열린 상세 시트는 월·날짜를 바꿔도 남긴다
  const expense = params.get(URL_PARAMS.expense);

  const go = (nextDate: string) => {
    router.replace(calendarPath(nextDate, expense), { scroll: false });
  };

  useEffect(() => {
    if (needsReplace)
      router.replace(calendarPath(date, expense), { scroll: false });
  }, [needsReplace, router, date, expense]);

  return {
    month,
    date,
    /** 날짜를 고른다. 다른 달의 날짜면 그 달로 옮긴다 */
    selectDate: go,
    /** 그 달로 옮긴다: 이번 달이면 오늘, 아니면 1일을 고른다 */
    moveToMonth: (nextMonth: string) => go(defaultDateOf(nextMonth, today)),
  };
};
