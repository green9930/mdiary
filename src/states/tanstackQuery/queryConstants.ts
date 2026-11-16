/**
 * 조회 캐시 키의 첫 칸 (데이터 아키텍처 8-4). 키는 `[QUERY_KEYS.이름, ...조건]`으로 만든다
 * (예: `[QUERY_KEYS.monthTotals, "2026-10"]`)
 */
export const QUERY_KEYS = {
  /** 계정 요약: 이메일·가장 오래된 연도·전체 건수 (`/api/me`) */
  accountSummary: "accountSummary",
  /** 한 달의 날짜별 합계·월 합계 (`/api/calendar`) */
  monthTotals: "monthTotals",
  /** 하루 기록 목록 (`/api/expenses?date=`) */
  dayExpenses: "dayExpenses",
  /** 기간 안 카테고리별 합계·비중 (`/api/stats`) */
  categoryStats: "categoryStats",
  /** 카테고리별 화면의 기록 목록 (`/api/expenses?from=…`) */
  categoryExpenses: "categoryExpenses",
  /** 검색 결과와 요약 (`/api/search`) */
  searchResults: "searchResults",
  /** 자주 쓴 제목 추천 (`/api/titles`) */
  titleSuggestions: "titleSuggestions",
  /** 기록 1건 + 반복 정보 (`/api/expenses/:id`) */
  expenseDetail: "expenseDetail",
} as const;

/** 등록·수정·삭제가 성공하면 무효화하는 키. 범위 수정은 여러 달에 걸치므로 키를 골라 지우지 않는다 */
export const EXPENSE_QUERY_KEYS = [
  QUERY_KEYS.accountSummary,
  QUERY_KEYS.monthTotals,
  QUERY_KEYS.dayExpenses,
  QUERY_KEYS.categoryStats,
  QUERY_KEYS.categoryExpenses,
  QUERY_KEYS.searchResults,
  QUERY_KEYS.titleSuggestions,
  QUERY_KEYS.expenseDetail,
] as const;

/** 조회 규칙 */
export const QUERY_RULES = {
  /** 실패한 조회를 다시 시도하는 최대 횟수 (401은 다시 시도하지 않는다) */
  maxRetries: 3,
} as const;
