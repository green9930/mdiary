import { apiFetch } from "@/api/apiClient";
import type {
  CreatedExpense,
  CreateExpenseRequestType,
  ExpenseListItem,
  TitleSuggestion,
} from "@/types/expenseTypes";

/** 지출 등록 (데이터 아키텍처 8-1 `POST /api/expenses`) */
export const createExpense = (request: CreateExpenseRequestType) =>
  apiFetch<CreatedExpense>("/api/expenses", {
    method: "POST",
    body: JSON.stringify(request),
  });

/** 자주 쓴 제목 (`GET /api/titles`) */
export const getTitles = async () =>
  (await apiFetch<{ titles: TitleSuggestion[] }>("/api/titles")).titles;

/** 하루 기록 목록, 등록 순 (`GET /api/expenses?date=`) */
export const getDayExpenses = async (date: string) =>
  (
    await apiFetch<{ items: ExpenseListItem[] }>(
      `/api/expenses?${new URLSearchParams({ date })}`,
    )
  ).items;
