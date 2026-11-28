import { apiFetch } from "@/api/apiClient";
import type {
  CreatedExpense,
  CreateExpenseRequestType,
  ExpenseDetail,
  ExpenseListItem,
  ScopePreview,
  ScopeType,
  TitleSuggestion,
  UpdateExpenseRequestType,
} from "@/types/expenseTypes";

/** 지출 등록 (데이터 아키텍처 8-1 `POST /api/expenses`) */
export const postExpense = (request: CreateExpenseRequestType) =>
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

const expensePath = (id: string) => `/api/expenses/${encodeURIComponent(id)}`;

/** 기록 1건 + (optional) 반복 정보 (`GET /api/expenses/:id`) */
export const getExpense = (id: string) =>
  apiFetch<ExpenseDetail>(expensePath(id));

/** 기록 수정: 바꾼 필드 + scope (`PATCH /api/expenses/:id`) */
export const patchExpense = (id: string, request: UpdateExpenseRequestType) =>
  apiFetch<{ updated: number }>(expensePath(id), {
    method: "PATCH",
    body: JSON.stringify(request),
  });

/** 기록 삭제: 범위 (`DELETE /api/expenses/:id`) */
export const deleteExpense = (id: string, scope: ScopeType) =>
  apiFetch<{ deleted: number }>(expensePath(id), {
    method: "DELETE",
    body: JSON.stringify({ scope }),
  });

/** 반복 기록 범위 미리보기. date는 수정에서 바꾼 날짜 (`GET /api/expenses/:id/scope`) */
export const getScopePreview = (id: string, scope: ScopeType, date?: string) =>
  apiFetch<ScopePreview>(
    `${expensePath(id)}/scope?${new URLSearchParams({
      scope: scope.type,
      ...(scope.type === "count" ? { n: String(scope.n) } : {}),
      ...(date ? { date } : {}),
    })}`,
  );
