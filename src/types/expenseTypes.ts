import type { z } from "zod";

import type { CATEGORY_LIST } from "@/shared/expenseConstants";
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

/** 수정 요청 본문: 바꾼 필드 + scope (데이터 아키텍처 8-1) */
export type UpdateExpenseRequestType = z.input<typeof updateExpenseSchema>;

/** 검증을 거친 수정 값 */
export type UpdateExpenseType = z.output<typeof updateExpenseSchema>;

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
  /** 숫자만 담은 문자열. 비어 있을 수 있다 */
  amount: string;
  content: string;
}
