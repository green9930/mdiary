import { defaultDateOf, isValidDate, isValidMonth, monthOf } from "@/lib/date";

interface CalendarQueryInput {
  month: string | null;
  date: string | null;
}

interface CalendarQuery {
  month: string;
  date: string;
}

/**
 * 달력 쿼리를 정한다 (화면 명세 SC-03). 잘못된 값은 오류 없이 기본값(이번 달, 오늘)으로 바꾼다.
 * 선택 가능 연도 밖의 달도 잘못된 값으로 본다
 */
export const resolveCalendarQuery = (
  input: CalendarQueryInput,
  today: string,
): CalendarQuery => {
  const month =
    input.month !== null && isValidMonth(input.month)
      ? input.month
      : monthOf(today);
  const date =
    input.date !== null &&
    isValidDate(input.date) &&
    monthOf(input.date) === month
      ? input.date
      : defaultDateOf(month, today);
  return { month, date };
};
