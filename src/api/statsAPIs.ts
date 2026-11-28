import { apiFetch } from "@/api/apiClient";
import type { CategoryStats, Period } from "@/types/expenseTypes";

/** 기간의 카테고리별 합계 (데이터 아키텍처 8-1 `GET /api/stats`) */
export const getCategoryStats = ({ from, to }: Period) =>
  apiFetch<CategoryStats>(`/api/stats?${new URLSearchParams({ from, to })}`);
