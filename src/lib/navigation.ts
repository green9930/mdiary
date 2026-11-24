import { monthOf } from "@/lib/date";
import { PATHS } from "@/shared/sharedConstants";

/**
 * 페이지를 새로 불러오며 이동한다. 로그아웃·세션 만료처럼 화면에 남은 데이터(조회 캐시 등)를
 * 모두 버려야 할 때 쓴다. 그 밖의 이동은 Next의 router를 쓴다
 */
export const hardNavigate = (path: string) => {
  window.location.assign(path);
};

/** 그 날짜가 선택된 달력 주소 (`/?month=2026-10&date=2026-10-18`) */
export const calendarPath = (date: string) =>
  `${PATHS.calendar}?${new URLSearchParams({ month: monthOf(date), date })}`;

/** 그 날짜로 여는 등록 화면 주소 (`/expenses/new?date=2026-10-19`) */
export const newExpensePath = (date: string) =>
  `${PATHS.newExpense}?${new URLSearchParams({ date })}`;
