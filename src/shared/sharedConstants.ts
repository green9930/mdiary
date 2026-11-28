// 여러 화면·모듈이 두루 쓰는 상수

import { EXPENSE_RULES, SERIES_RULES } from "@/shared/expenseConstants";

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

/** 화면 상태를 담는 URL 쿼리 이름 (화면 명세 공통 규약 · 상태를 URL에 둔다) */
export const URL_PARAMS = {
  /** 열린 상세 시트의 기록 id (SC-08) */
  expense: "expense",
  /** 조회 기간의 시작·끝 달 YYYY-MM (SC-04) */
  from: "from",
  to: "to",
  /** 카테고리 필터. 카테고리 값의 소문자 (SC-04) */
  category: "category",
  /** 목록 정렬 latest | amount (SC-04) */
  sort: "sort",
} as const;

/** 화면 제목 (화면 명세). 탭 라벨·헤더 제목·페이지 제목이 같이 쓴다 */
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
  calculate: "계산",
  apply: "적용",
} as const;

/** 불러오기 상태 문구 (와이어프레임 CM ②~④) */
export const STATE_TEXTS = {
  loadFailed: "불러오지 못했습니다.",
  refreshFailed: "최신 내용을 불러오지 못했습니다.",
  loadMoreFailed: "더 불러오지 못했습니다.",
  noRecords: "기록이 없습니다.",
  /** 조회 기간에 기록이 없을 때 (SC-04) */
  noPeriodRecords: "해당 기간 내 기록이 없습니다.",
  /** 고른 카테고리에 기록이 없을 때 (SC-04) */
  noCategoryRecords: (category: string) =>
    `해당 기간 내 ${category} 기록이 없습니다.`,
} as const;

/** 단위 */
export const UNITS = {
  won: "원",
  man: "만",
  eok: "억",
  /** 기록 건수 */
  count: "건",
} as const;

// 여러 실패 문구가 같이 쓰는 끝맺음
const RETRY_LATER = "잠시 후 다시 시도해 주세요.";

/** 로그인 화면 문구 (화면 명세 SC-02) */
export const LOGIN_TEXTS = {
  tagline: "나의 지출만 확인하고 싶을 때",
  expired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  withdrawn: "탈퇴가 완료되었습니다.",
  failed: `로그인에 실패했습니다. ${RETRY_LATER}`,
} as const;

/** 월간 달력 문구 (화면 명세 SC-03) */
export const CALENDAR_TEXTS = {
  /** 월 합계 라벨: `Total.` */
  totalLabel: "Total.",
  /** 하루 목록 건수: `2건` */
  dayCount: (count: number) => `${count}${UNITS.count}`,
} as const;

/** 알림·확인 다이얼로그 문구 (와이어프레임 CM ⑤⑥, SC-06 ⑭, SC-10 ⑤) */
export const DIALOG_TEXTS = {
  saveTitle: "저장하기",
  saveFailed: `저장하지 못했습니다. ${RETRY_LATER}`,
  saveDoneTitle: "저장 완료",
  saveDoneBody: "기록을 저장했습니다.",
  deleteTitle: "삭제하기",
  deleteFailed: `삭제하지 못했습니다. ${RETRY_LATER}`,
  signOutTitle: "로그아웃하기",
  signOutFailed: `로그아웃하지 못했습니다. ${RETRY_LATER}`,
  leaveTitle: "작성 취소",
  leaveBody: "작성 중인 내용이 사라집니다. 나가시겠습니까?",
  deleteBody: "이 기록을 삭제하시겠습니까?",
  /** 반복 기록 범위 삭제 (SC-09) */
  deleteCount: (count: number) => `${count}${UNITS.count}을 삭제하시겠습니까?`,
  /** 계속 반복하는 정기지출의 이후 전체 삭제 (SC-09) */
  deleteContinuousEnd: "이 건부터 반복이 종료됩니다. 삭제하시겠습니까?",
  notFoundTitle: "기록 없음",
  notFoundBody: "이미 삭제된 기록입니다.",
} as const;

/** 조회 기간 문구 (화면 명세 SC-04·SC-05 기간, 공통 규약 날짜 표시). 월은 `2026년 10월` 형식 문자열로 받는다 */
export const PERIOD_TEXTS = {
  /** `2025년 11월 ~ 2026년 10월` */
  range: (from: string, to: string) => `${from} ~ ${to}`,
  /** 기간 드롭다운의 빠른 선택 이름. 키는 이번 달을 포함한 개월 수 (CATEGORY_PERIOD_RULES.quickMonths) */
  quick: {
    1: "이번 달",
    3: "최근 3개월",
    6: "최근 6개월",
    12: "최근 1년",
  },
  start: "시작",
  end: "끝",
  /** 기간 선택 [적용]을 막는 이유 */
  maxRange: "최대 5년까지 조회할 수 있습니다.",
} as const;

/** 목록 정렬 (화면 명세 SC-04) */
export const SORT_TEXTS = {
  latest: "최신순",
  amount: "큰 금액순",
} as const;

/** 카테고리별 집계 문구 (화면 명세 SC-04) */
export const STATS_TEXTS = {
  /** 기간 요약: `총지출 · 42건` */
  summary: (count: number) => `총지출 · ${count}${UNITS.count}`,
  all: "전체",
  /** 목록 요약: `전체 · 42건 · 1,234,500원` (금액은 쉼표·원을 붙인 문자열) */
  listSummary: (label: string, count: number, total: string) =>
    `${label} · ${count}${UNITS.count} · ${total}`,
  /** 비중이 0.1% 미만 */
  belowTenth: "<0.1%",
} as const;

// 반복 문구가 서로 이어 쓰는 말
const INSTALLMENT = "할부";
const COUNT_UNIT = "회";
const CONTINUOUS = "계속";
const SCOPE_AFTER = "이후 전체";
const monthlyOn = (day: number) => `매달 ${day}일`;

/**
 * 반복 기록 문구 (화면 명세 SC-06 반복 입력, SC-08 반복 정보, SC-09 범위 선택).
 * 금액은 쉼표·원을 붙인 문자열, 월은 `2026년 10월` 형식 문자열로 받는다
 */
export const REPEAT_TEXTS = {
  // 반복 입력 (SC-06)
  none: "일시불",
  recurring: "정기지출",
  installment: INSTALLMENT,
  continuous: CONTINUOUS,
  months: "기간 선택",
  perCount: "회차당 금액",
  total: "총액",
  monthUnit: "개월",
  countUnit: COUNT_UNIT,

  // 반복 미리보기 (SC-06 ⑤⑥). 기간은 PERIOD_TEXTS.range
  lastDayNote: "없는 달은 말일로 기록됩니다.",
  /** `회차당 33,333원` */
  perCountAmount: (amount: string) => `회차당 ${amount}`,
  /** `1회차 33,334원 · 2~3회차 33,333원`. 2회면 `2회차` */
  firstAndRest: (first: string, rest: string, count: number) =>
    `1회차 ${first} · ${count === 2 ? "2" : `2~${count}`}회차 ${rest}`,

  // 상세의 반복 정보 (SC-08)
  /** `매달 25일` */
  monthlyOn,
  /** 계속 반복하는 정기지출 줄 끝 (`정기지출 · 매달 25일 · 반복`) */
  continuousInfo: "반복",
  /** `할부 2/3회 · 총 300,000원` */
  installmentInfo: (seq: number, total: number, totalAmount: string) =>
    `${INSTALLMENT} ${seq}/${total}${COUNT_UNIT} · 총 ${totalAmount}`,

  // 수정·삭제 범위 선택 (SC-09)
  scopeOne: "이번 건만",
  scopeAfter: SCOPE_AFTER,
  /** 할부의 이후 전체 */
  scopeAfterInstallment: `${SCOPE_AFTER} (남은 회차)`,
  /** `이 건부터 [N] 개월`의 앞부분 */
  scopeCountPrefix: "이 건부터",
  /** `2026년 10월 25일 1건` */
  scopeOneDay: (date: string, count: number) =>
    `${date} ${count}${UNITS.count}`,
  /** `2026년 10월 ~ 2027년 3월 (6건)` (기간은 PERIOD_TEXTS.range로 만든 문자열) */
  scopeRangeCount: (range: string, count: number) =>
    `${range} (${count}${UNITS.count})`,
  /** `2026년 10월부터 계속` */
  scopeFromContinuous: (month: string) => `${month}부터 ${CONTINUOUS}`,
  /** `2027년 1월부터 계속 · 매달 3일` (날짜를 바꾼 계속 반복) */
  scopeFromContinuousOn: (month: string, day: number) =>
    `${month}부터 ${CONTINUOUS} · ${monthlyOn(day)}`,
  scopeLaterMonthHint:
    "날짜의 달을 바꾸면 이 건부터 N개월은 선택할 수 없습니다.",
  scopeEarlierMonthHint: "앞 달로 옮기면 이번 건만 수정할 수 있습니다.",
} as const;

/** 반복 배지 (화면 명세 SC-03 하루 목록, SC-04 카테고리별, SC-05 검색) */
export const BADGE_TEXTS = {
  recurring: "정기",
  /** `할부 3/12` */
  installment: (seq: number, total: number) => `${INSTALLMENT} ${seq}/${total}`,
} as const;

export const SHEET_TITLES = {
  datePicker: "날짜 선택",
  monthPicker: "연·월 선택",
  /** 상세 시트의 접근성 이름. 화면에는 보이지 않는다 */
  expenseDetail: "기록 상세",
  /** 계산기 시트의 접근성 이름. 화면에는 보이지 않는다 */
  calculator: "계산기",
  /** 반복 기록 범위 선택 (SC-09) */
  scopeEdit: "반복 기록 수정",
  scopeDelete: "반복 기록 삭제",
  /** 조회 기간의 시작·끝 달 선택 (SC-04·SC-05) */
  periodPicker: "기간 선택",
} as const;

/** 화면에는 보이지 않고 스크린 리더가 읽는 이름 */
export const ARIA_LABELS = {
  back: "뒤로",
  mainNav: "주요 화면",
  loading: "불러오는 중",
  prevMonth: "이전 달",
  nextMonth: "다음 달",
  prevYear: "이전 해",
  nextYear: "다음 해",
  /** 연·월 선택 시트를 여는 버튼 */
  openMonthPicker: SHEET_TITLES.monthPicker,
  backspace: "한 글자 지우기",
  clear: "식 전체 지우기",
  roundingUnit: "끝전 처리 단위",
  roundingDirection: "끝전 처리 방향",
  repeatMonths: "개월 수",
  installmentCount: "회차",
  /** 반복 기록 범위 라디오 묶음 (SC-09) */
  scope: "적용 범위",
  /** 기간 드롭다운 (SC-04·SC-05) */
  period: "기간",
  /** 기간 선택 시트를 여는 버튼 */
  openPeriodPicker: SHEET_TITLES.periodPicker,
  sort: "정렬",
  categoryFilter: "카테고리 필터",
  /** 카테고리별 비중 막대 묶음 (SC-04) */
  categoryShare: "카테고리별 비중",
} as const;

/** 입력·조작 안내 */
export const FIELD_HINTS = {
  /** 수정 화면의 반복 잠금 (화면 명세 SC-06) */
  repeatLocked: "반복 종류와 기간은 바꿀 수 없습니다.",
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

const DATE_LABEL = "날짜";

/** 입력 라벨 (화면 명세 SC-06) */
export const FIELD_LABELS = {
  date: DATE_LABEL,
  title: "제목",
  category: "카테고리",
  amount: "금액",
  content: "내용 (선택)",
  repeat: "반복",
  /** 정기지출을 고르면 날짜 라벨 */
  dateFirstRecurring: `${DATE_LABEL} (첫 결제일)`,
  /** 할부를 고르면 날짜 라벨 */
  dateFirstInstallment: `${DATE_LABEL} (1회차 결제일)`,
  /** 할부 총액 기준이면 금액 라벨 */
  amountTotal: REPEAT_TEXTS.total,
  period: "기간",
  installmentBasis: "금액 기준 · 회차",
} as const;

/** 입력칸 placeholder (와이어프레임 SC-06 ①) */
export const PLACEHOLDERS = {
  title: "제목을 입력해 주세요",
  amount: "0",
  content: "메모",
  /** 개월 수·회차 (`2~99`) */
  repeatCount: `${SERIES_RULES.repeatMin}~${SERIES_RULES.repeatMax}`,
} as const;

/** 필드 오류 문구 (화면 명세 SC-06). 개월 수·회차 문구는 그 칸의 이름을 쓴다 (이름이 받침으로 끝나면 조사를 고친다) */
export const FIELD_ERRORS = {
  titleRequired: "제목을 입력해 주세요.",
  categoryRequired: "카테고리를 선택해 주세요.",
  amountRequired: "금액을 입력해 주세요.",
  monthsRequired: `${ARIA_LABELS.repeatMonths}를 입력해 주세요.`,
  countRequired: `${ARIA_LABELS.installmentCount}를 입력해 주세요.`,
  repeatMin: `${SERIES_RULES.repeatMin}부터 입력할 수 있습니다.`,
  totalBelowCount: "총액은 회차 수 이상이어야 합니다.",
  overYearMax: `${DATE_RULES.maxDate.slice(0, 4)}년 12월까지만 기록할 수 있습니다.`,
  /** 범위의 N이 남은 건수(계속 반복은 99)를 넘음 (SC-09) */
  scopeCountMax: (max: number) =>
    `${max}${REPEAT_TEXTS.monthUnit}까지 입력할 수 있습니다.`,
} as const;

// 계산기 문구가 이어 쓰는 말
const ROUND_UP = "올림";
const ROUND_DOWN = "버림";

/** 계산기 문구 (화면 명세 SC-07) */
export const CALCULATOR_TEXTS = {
  recordFormula: "계산식을 내용에 기록",
  rounding: "끝전 처리",
  roundUp: ROUND_UP,
  roundDown: ROUND_DOWN,
  /** 끝전 처리 단위 칸 (`10원`) */
  unit: (unit: number) => `${unit}${UNITS.won}`,
  /** 내용에 남기는 계산식 끝의 끝전 처리 표시 (`(10원 올림)`) */
  roundingNote: (unit: number, up: boolean) =>
    `(${unit}${UNITS.won} ${up ? ROUND_UP : ROUND_DOWN})`,
  /** 결과 미리보기 (`= 40,500`) */
  result: (value: string) => `= ${value}`,
  /** 키패드 C (식 전체 지우기) */
  clearKey: "C",
  /** 키패드 ← (한 글자 지우기) */
  backspaceKey: "←",
  contentOverflow: `내용이 ${EXPENSE_RULES.contentMax}자를 넘어 계산식은 기록되지 않습니다.`,
} as const;

/** 계산기 [적용]을 막는 이유 (화면 명세 SC-07) */
export const CALCULATOR_ERRORS = {
  belowMin: `결과가 ${EXPENSE_RULES.amountMin}${UNITS.won} 이상이어야 적용할 수 있습니다.`,
  divideByZero: "0으로 나눌 수 없습니다.",
  overMax: `${EXPENSE_RULES.amountMax.toLocaleString("ko-KR")}${UNITS.won}까지 적용할 수 있습니다.`,
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
