import {
  type CategoriesQuery,
  convertCategorySlug,
} from "@/lib/categoriesUtils";
import { monthOf } from "@/lib/date";
import { PATHS, URL_PARAMS } from "@/shared/sharedConstants";

/**
 * 페이지를 새로 불러오며 이동한다. 로그아웃·세션 만료처럼 화면에 남은 데이터(조회 캐시 등)를
 * 모두 버려야 할 때 쓴다. 그 밖의 이동은 Next의 router를 쓴다
 */
export const hardNavigate = (path: string) => {
  window.location.assign(path);
};

/**
 * 그 날짜가 선택된 달력 주소 (`/?month=2026-10&date=2026-10-18`).
 * expense를 주면 그 기록의 상세 시트가 열린 주소다 (`&expense={id}`)
 */
export const calendarPath = (date: string, expense?: string | null) => {
  const params = new URLSearchParams({ month: monthOf(date), date });
  if (expense) params.set(URL_PARAMS.expense, expense);
  return `${PATHS.calendar}?${params}`;
};

/**
 * 카테고리별 주소 (`/categories?from=2025-11&to=2026-10&category=food&sort=latest`).
 * 카테고리는 골랐을 때만 담는다. expense를 주면 그 기록의 상세 시트가 열린 주소다
 */
export const categoriesPath = (
  { from, to, category, sort }: CategoriesQuery,
  expense?: string | null,
) => {
  const params = new URLSearchParams({ from, to });
  if (category) params.set(URL_PARAMS.category, convertCategorySlug(category));
  params.set(URL_PARAMS.sort, sort);
  if (expense) params.set(URL_PARAMS.expense, expense);
  return `${PATHS.categories}?${params}`;
};

/** 그 날짜로 여는 등록 화면 주소 (`/expenses/new?date=2026-10-19`) */
export const newExpensePath = (date: string) =>
  `${PATHS.newExpense}?${new URLSearchParams({ date })}`;

/** 기록 수정 화면 주소 (`/expenses/{id}/edit`) */
export const editExpensePath = (id: string) =>
  `/expenses/${encodeURIComponent(id)}/edit`;
