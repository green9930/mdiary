import { apiFetch } from "@/api/apiClient";
import type { MonthTotals } from "@/types/expenseTypes";

/** 한 달의 날짜별 합계·월 합계 (데이터 아키텍처 8-1 `GET /api/calendar`) */
export const getMonthTotals = (month: string) =>
  apiFetch<MonthTotals>(`/api/calendar?${new URLSearchParams({ month })}`);
