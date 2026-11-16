import type { z } from "zod";

import type { CATEGORY_LIST } from "@/shared/expenseConstants";
import type { createExpenseSchema } from "@/shared/expenseSchema";

/** 카테고리 enum 값 (데이터 아키텍처 4-4) */
export type CategoryType = (typeof CATEGORY_LIST)[number]["value"];

/** 등록 요청 본문 (데이터 아키텍처 8-2) */
export type CreateExpenseRequestType = z.input<typeof createExpenseSchema>;

/** 검증을 거친 등록 값 (제목·내용 정리 후) */
export type CreateExpenseType = z.output<typeof createExpenseSchema>;

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
