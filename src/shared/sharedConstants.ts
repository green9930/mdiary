// 여러 화면·모듈이 두루 쓰는 상수

/** 화면 경로 (화면 명세) */
export const PATHS = {
  calendar: "/",
  categories: "/categories",
  search: "/search",
  settings: "/settings",
  newExpense: "/expenses/new",
  login: "/login",
} as const;

/** 화면 제목 (화면 명세). 탭 라벨·헤더 제목·페이지 제목이 같이 쓴다 */
export const PAGE_TITLES = {
  calendar: "달력",
  categories: "카테고리",
  search: "검색",
  settings: "설정",
  newExpense: "기록하기",
} as const;

/** 하단 탭 바의 탭 (화면 명세 SC-01). ＋ 등록 버튼은 가운데에 따로 둔다 */
export const TABS_LIST = [
  { label: PAGE_TITLES.calendar, path: PATHS.calendar },
  { label: PAGE_TITLES.categories, path: PATHS.categories },
  { label: PAGE_TITLES.search, path: PATHS.search },
  { label: PAGE_TITLES.settings, path: PATHS.settings },
] as const;

export type TTab = (typeof TABS_LIST)[number];
