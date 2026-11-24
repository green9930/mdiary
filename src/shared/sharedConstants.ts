// 여러 화면·모듈이 두루 쓰는 상수

/** 서비스 이름. ko: 로고와 브라우저 탭 제목, en: 로그인 화면 로고 아래 (화면 명세 SC-02) */
export const APP_NAME = {
  ko: "다씀",
  en: "Money Diary",
} as const;

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
/** 화면 상태를 담는 URL 쿼리 이름 (화면 명세 공통 규약 · 상태를 URL에 둔다) */
export const URL_PARAMS = {
  /** 열린 상세 시트의 기록 id (SC-08) */
  expense: "expense",
} as const;

export const PAGE_TITLES = {
  calendar: "달력",
  categories: "카테고리",
  search: "검색",
  settings: "설정",
  newExpense: "기록하기",
  editExpense: "수정하기",
} as const;

/** 버튼 글자 */
export const BTN_TEXTS = {
  googleSignIn: "Google로 계속하기",
  signOut: "로그아웃",
  retry: "다시 시도",
  confirm: "확인",
  save: "저장",
  select: "선택",
  keepWriting: "계속 작성",
  leave: "나가기",
  today: "오늘",
  addRecord: "기록 추가하기",
  edit: "수정",
  delete: "삭제",
  cancel: "취소",
} as const;

/** 불러오기 상태 문구 (와이어프레임 CM ②~④) */
export const STATE_TEXTS = {
  loadFailed: "불러오지 못했습니다.",
  refreshFailed: "최신 내용을 불러오지 못했습니다.",
  loadMoreFailed: "더 불러오지 못했습니다.",
  noRecords: "기록이 없습니다.",
} as const;

/** 월간 달력 문구 (화면 명세 SC-03) */
export const CALENDAR_TEXTS = {
  /** 월 합계 라벨: `Total.` */
  totalLabel: "Total.",
  /** 하루 목록 건수: `2건` */
  dayCount: (count: number) => `${count}건`,
} as const;

/** 반복 배지 (화면 명세 SC-03 하루 목록, SC-04 카테고리별, SC-05 검색) */
export const BADGE_TEXTS = {
  recurring: "정기",
  /** `할부 3/12` */
  installment: (seq: number, total: number) => `할부 ${seq}/${total}`,
} as const;

/** 로그인 화면 문구 (화면 명세 SC-02) */
export const LOGIN_TEXTS = {
  tagline: "나의 지출만 확인하고 싶을 때",
  expired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  withdrawn: "탈퇴가 완료되었습니다.",
  failed: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
} as const;

/** 알림 다이얼로그 문구 (와이어프레임 CM ⑤⑥, SC-06 ⑭, SC-10 ⑤) */
export const DIALOG_TEXTS = {
  saveTitle: "저장하기",
  saveFailed: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  saveDoneTitle: "저장 완료",
  saveDoneBody: "기록을 저장했습니다.",
  deleteTitle: "삭제하기",
  deleteFailed: "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  signOutTitle: "로그아웃하기",
  signOutFailed: "로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  leaveTitle: "작성 취소",
  leaveBody: "작성 중인 내용이 사라집니다. 나가시겠습니까?",
  deleteBody: "이 기록을 삭제하시겠습니까?",
  notFoundTitle: "기록 없음",
  notFoundBody: "이미 삭제된 기록입니다.",
} as const;

/** 바텀시트 제목 */
/** 상세의 반복 정보 (화면 명세 SC-08) */
export const SERIES_TEXTS = {
  recurring: "정기지출",
  /** `매달 25일` */
  monthlyOn: (day: number) => `매달 ${day}일`,
  continuous: "반복",
  /** `할부 2/3회 · 총 300,000원` (총액은 쉼표·원을 붙인 문자열) */
  installment: (seq: number, total: number, totalAmount: string) =>
    `할부 ${seq}/${total}회 · 총 ${totalAmount}`,
} as const;

/** 입력·조작 안내 */
export const FIELD_HINTS = {
  /** 임시: F6에서 범위 선택을 붙이면 지운다 */
  repeatLocked: "반복 기록은 F6 이후 수정·삭제할 수 있습니다",
} as const;

export const SHEET_TITLES = {
  datePicker: "날짜 선택",
  monthPicker: "연·월 선택",
  /** 상세 시트의 접근성 이름. 화면에는 보이지 않는다 */
  expenseDetail: "기록 상세",
} as const;

/** 입력 라벨 (화면 명세 SC-06) */
export const FIELD_LABELS = {
  date: "날짜",
  title: "제목",
  category: "카테고리",
  amount: "금액",
  content: "내용 (선택)",
} as const;

/** 입력칸 placeholder (와이어프레임 SC-06 ①) */
export const PLACEHOLDERS = {
  title: "제목을 입력해 주세요",
  amount: "0",
  content: "메모",
} as const;

/** 필드 오류 문구 (화면 명세 SC-06) */
export const FIELD_ERRORS = {
  titleRequired: "제목을 입력해 주세요.",
  categoryRequired: "카테고리를 선택해 주세요.",
  amountRequired: "금액을 입력해 주세요.",
} as const;

/** 입력칸 단위 */
export const UNITS = {
  won: "원",
  man: "만",
  eok: "억",
} as const;

/** 날짜 규칙 (화면 명세 공통 정책값, 데이터 아키텍처 3-1·3-2) */
export const DATE_RULES = {
  /** 날짜 문자열 형식 YYYY-MM-DD */
  pattern: /^\d{4}-\d{2}-\d{2}$/,
  /** 월 문자열 형식 YYYY-MM */
  monthPattern: /^\d{4}-\d{2}$/,
  /** 선택 가능 연도의 처음 */
  minDate: "2020-01-01",
  /** 입력 검증용 기술 상한 (선택 가능 연도) */
  maxDate: "2099-12-31",
  /** 달력은 항상 6줄로 그린다 (SC-03) */
  calendarWeeks: 6,
} as const;

/** 입력 글자 규칙 (화면 명세 공통 규약 · 입력) */
export const TEXT_RULES = {
  /**
   * 저장할 때 지우는 보이지 않는 글자: 줄바꿈(\n)을 뺀 제어문자, 폭 없는 공백·방향 표시·BOM.
   * 이모지를 잇는 ZWJ(U+200D)는 남긴다
   */
  invisibleChars: new RegExp(
    String.raw`[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]`,
    "g",
  ),
} as const;

/** 요일 (일요일부터) */
export const WEEKDAY_LABELS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
] as const;

/** 화면에는 보이지 않고 스크린 리더가 읽는 이름 */
export const ARIA_LABELS = {
  back: "뒤로",
  mainNav: "주요 화면",
  loading: "불러오는 중",
  prevMonth: "이전 달",
  nextMonth: "다음 달",
  prevYear: "이전 해",
  nextYear: "다음 해",
  openMonthPicker: "연·월 선택",
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
