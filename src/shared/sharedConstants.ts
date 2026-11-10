// 여러 화면·모듈이 두루 쓰는 상수

/** 서비스 이름. 로고와 브라우저 탭 제목에 쓴다 */
export const APP_NAME = "다씀";

/** 화면 경로 (화면 명세) */
export const PATHS = {
  calendar: "/",
  categories: "/categories",
  search: "/search",
  settings: "/settings",
  newExpense: "/expenses/new",
  login: "/login",
  /** 공통 컴포넌트 견본. 로그인 없이 열린다 (휴대폰 확인용). 운영 빌드에서는 404 */
  devComponents: "/dev/components",
} as const;

/** 화면 제목 (화면 명세). 탭 라벨·헤더 제목·페이지 제목이 같이 쓴다 */
export const PAGE_TITLES = {
  calendar: "달력",
  categories: "카테고리",
  search: "검색",
  settings: "설정",
  newExpense: "기록하기",
} as const;

/** 버튼 글자 */
export const BTN_TEXTS = {
  googleSignIn: "Google로 계속하기",
} as const;

/** 화면에는 보이지 않고 스크린 리더가 읽는 이름 */
export const ARIA_LABELS = {
  back: "뒤로",
  mainNav: "주요 화면",
} as const;

/** 쿠키 이름 */
export const COOKIES = {
  /** 화면 모드 (SC-10). 이 기기에만 저장하므로 쿠키에 둔다. 서버가 첫 화면부터 html의 data-theme를 그려 깜빡이지 않는다 */
  theme: "theme",
} as const;

/** 하단 탭 바의 탭 (화면 명세 SC-01). ＋ 등록 버튼은 가운데에 따로 둔다 */
export const TABS_LIST = [
  { label: PAGE_TITLES.calendar, path: PATHS.calendar },
  { label: PAGE_TITLES.categories, path: PATHS.categories },
  { label: PAGE_TITLES.search, path: PATHS.search },
  { label: PAGE_TITLES.settings, path: PATHS.settings },
] as const;
