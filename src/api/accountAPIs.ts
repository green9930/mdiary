import { apiFetch } from "@/api/apiClient";
import type { AccountSummary } from "@/types/expenseTypes";

/** 계정 요약 (데이터 아키텍처 8-1 `GET /api/me`) */
export const getAccountSummary = () => apiFetch<AccountSummary>("/api/me");
