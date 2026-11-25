/** 카테고리 10개 (데이터 아키텍처 4-4). 순서는 화면 격자·금액이 같을 때 정렬 순서다 */
export const CATEGORY_LIST = [
  { value: "FOOD", label: "식비" },
  { value: "APPLIANCE", label: "가전" },
  { value: "TRANSPORT", label: "교통" },
  { value: "MEDICAL", label: "의료" },
  { value: "CLOTHING", label: "의류" },
  { value: "BEAUTY", label: "미용" },
  { value: "CULTURE", label: "문화" },
  { value: "EDUCATION", label: "교육" },
  { value: "LIVING", label: "생활" },
  { value: "ETC", label: "기타" },
] as const;

/** 지출 규칙 (화면 명세 공통 정책값, 데이터 아키텍처 3-2·6장) */
export const EXPENSE_RULES = {
  /** 제목 최대 글자 수 (화면에 보이는 글자 단위) */
  titleMax: 25,
  /** 내용 최대 글자 수 (줄바꿈 1개 = 1자) */
  contentMax: 200,
  amountMin: 1,
  amountMax: 999_999_999,
  /** 금액 입력 최대 자릿수 */
  amountDigits: 9,
  /** 자주 쓴 제목: 화면에 보여 주는 최대 개수 */
  titleSuggestionMax: 5,
  /** 자주 쓴 제목: 추천 대상이 되는 최소 사용 횟수 (묶음 수) */
  titleSuggestionMinUses: 2,
  /** 자주 쓴 제목: 서버가 한 번에 내려주는 최대 개수 */
  titleSuggestionLoadMax: 300,
  /** 달력 칸에서 금액을 줄이기 시작하는 자릿수 (100만 원 이상 → `108만`) */
  calendarAbbrDigits: 7,
} as const;

/** 계산기 규칙 (화면 명세 SC-07, 공통 정책값 · 계산기 식). 숫자 하나의 자릿수는 EXPENSE_RULES.amountDigits */
export const CALCULATOR_RULES = {
  operatorMax: 10, // 식 하나에 넣을 수 있는 연산자 수
  roundingUnits: [1, 10, 100], // 끝전 처리 단위 (원)
  operatorSymbols: { "+": "+", "-": "−", "*": "×", "/": "÷" },
} as const;
