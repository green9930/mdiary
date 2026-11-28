import type { z } from "zod";

import type {
  CALCULATOR_RULES,
  CATEGORY_LIST,
} from "@/shared/expenseConstants";
import type {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/shared/expenseSchema";

/** 카테고리 enum 값 (데이터 아키텍처 4-4) */
export type CategoryType = (typeof CATEGORY_LIST)[number]["value"];

/** 등록 요청 본문 (데이터 아키텍처 8-2) */
export type CreateExpenseRequestType = z.input<typeof createExpenseSchema>;

/** 검증을 거친 등록 값 (제목·내용 정리 후) */
export type CreateExpenseType = z.output<typeof createExpenseSchema>;

/** 등록 요청의 반복 (데이터 아키텍처 8-2) */
export type RepeatType = CreateExpenseType["repeat"];

/** 반복 3단 선택 (화면 명세 SC-06) */
export type RepeatKindType = RepeatType["type"];

/** 정기지출 기간: 계속 / 기간 선택 */
export type RecurringPeriodType = "continuous" | "months";

/** 할부 금액 기준: 회차당 금액 / 총액 */
export type InstallmentBasisType = "perCount" | "total";

/** 수정 요청 본문: 바꾼 필드 + scope (데이터 아키텍처 8-1) */
export type UpdateExpenseRequestType = z.input<typeof updateExpenseSchema>;

/** 검증을 거친 수정 값 */
export type UpdateExpenseType = z.output<typeof updateExpenseSchema>;

/** 수정·삭제 범위 (데이터 아키텍처 8-1 `scope`) */
export type ScopeType = UpdateExpenseType["scope"];

/** 범위 미리보기 (`GET /api/expenses/:id/scope`, 데이터 아키텍처 5-6) */
export interface ScopePreview {
  /** 이 건을 포함한 남은 건수. 계속 반복이면 null */
  remaining: number | null;
  affected: {
    /** 영향받는 건수. 계속 반복의 이후 전체면 null (끝이 없다) */
    count: number | null;
    /** 첫 건의 달 (YYYY-MM). 뒤 달로 민 이후 전체면 민 달 */
    fromMonth: string;
    /** 마지막 건의 달. 계속 반복의 이후 전체면 null */
    toMonth: string | null;
    /** 계속 반복의 이후 전체인지 */
    continuous: boolean;
  };
}

/** 등록 응답 */
export interface CreatedExpense {
  id: string;
  date: string;
}

/** 자주 쓴 제목 (데이터 아키텍처 6장 제목 추천 목록, `GET /api/titles`) */
export interface TitleSuggestion {
  title: string;
  /** 그 제목을 쓴 묶음 수 */
  uses: number;
  /** 마지막으로 쓴 때 (ISO 문자열) */
  lastUsedAt: string;
  lastCategory: CategoryType;
}

/** 반복 종류 (데이터 아키텍처 4-3 SeriesType) */
export type SeriesKindType = "RECURRING" | "INSTALLMENT";

/** 목록 항목의 반복 정보. seq는 묶음에서 몇 번째인지, totalCount는 묶음 전체 건수 */
export type ExpenseListSeriesType =
  | {
      type: Extract<SeriesKindType, "RECURRING">;
      seq: number;
      /** 기간을 정했으면 개월 수, 계속 반복이면 null */
      totalCount: number | null;
    }
  | {
      type: Extract<SeriesKindType, "INSTALLMENT">;
      seq: number;
      /** 총 회차 */
      totalCount: number;
    };

/** 목록 항목 (데이터 아키텍처 8-1). 반복 기록이면 series가 있다 */
export interface ExpenseListItem {
  id: string;
  date: string;
  title: string;
  category: CategoryType;
  amount: number;
  series?: ExpenseListSeriesType;
}

/** 한 달의 날짜별 합계·월 합계 (`GET /api/calendar`) */
export interface MonthTotals {
  total: number;
  /** 기록이 있는 날만, 날짜 오름차순 */
  days: { date: string; total: number }[];
}

/** 조회 기간: 시작·끝 달 (YYYY-MM, 둘 다 포함) */
export interface Period {
  from: string;
  to: string;
}

/** 목록 정렬 (화면 명세 SC-04): 최신순 · 큰 금액순 */
export type ListSortType = "latest" | "amount";

/** 기간의 카테고리별 합계 (`GET /api/stats`). categories는 지출이 있는 카테고리만, 금액 내림차순 */
export interface CategoryStats {
  total: number;
  count: number;
  categories: { category: CategoryType; total: number; count: number }[];
}

/** 계정 요약 (`GET /api/me`) */
export interface AccountSummary {
  email: string;
  /** 저장된 모든 기록 건수 */
  totalCount: number;
}

/** 상세의 반복 정보 (데이터 아키텍처 6장 SC-08): 목록의 반복 정보 + 결제일·기간 */
export type ExpenseDetailSeriesType = ExpenseListSeriesType & {
  /** 원래 결제일 (말일 조정 전) */
  billingDay: number;
  /** 계속 반복하는 정기지출인지 */
  isContinuous: boolean;
  /** 할부 총액. 정기지출은 null */
  installmentTotal: number | null;
  /** 묶음 첫 행·마지막 행의 달 (YYYY-MM) */
  fromMonth: string;
  toMonth: string;
};

/** 기록 1건 (`GET /api/expenses/:id`). 반복 기록이면 series가 있다 */
export interface ExpenseDetail {
  expense: {
    id: string;
    date: string;
    title: string;
    category: CategoryType;
    amount: number;
    content: string | null;
  };
  series?: ExpenseDetailSeriesType;
}

/** 수정·삭제 결과에서 4xx로 답할 것. 못 찾으면 서비스는 null을 돌려준다 */
export interface ExpenseScopeRefused {
  error: "SCOPE_NOT_ALLOWED";
}

/** 등록·수정 폼의 값 (화면 명세 SC-06) */
export interface ExpenseFormValues {
  date: string;
  title: string;
  category: CategoryType | null;
  /** 숫자만 담은 문자열. 비어 있을 수 있다. 할부 총액 기준이면 총액 */
  amount: string;
  content: string;
  /** 반복. 종류를 바꿔도 종류별 값(기간·개월 수·금액 기준·회차)은 그대로 둔다 */
  repeat: RepeatKindType;
  recurringPeriod: RecurringPeriodType;
  /** 정기지출 개월 수 (숫자 문자열, 비어 있을 수 있다) */
  months: string;
  installmentBasis: InstallmentBasisType;
  /** 할부 회차 (숫자 문자열, 비어 있을 수 있다) */
  installmentCount: string;
}

/** 계산기 연산자 (`+ - * /`) */
export type CalculatorOperatorType =
  keyof (typeof CALCULATOR_RULES)["operatorSymbols"];

/** 계산기 숫자 키 */
export type CalculatorDigitType =
  "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "00";

/** 계산기 키: 숫자 · 연산자 · ←(backspace) · C(clear) */
export type CalculatorKeyType =
  CalculatorDigitType | CalculatorOperatorType | "backspace" | "clear";

/** 계산기 끝전 처리 단위 (원) */
export type RoundingUnitType =
  (typeof CALCULATOR_RULES)["roundingUnits"][number];

/** 계산기 끝전 처리: 단위 × 방향 (올림 up · 버림 down) */
export interface Rounding {
  unit: RoundingUnitType;
  direction: "up" | "down";
}
