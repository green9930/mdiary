import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getScopePreview } from "@/api/expenseAPIs";
import { QUERY_KEYS, QUERY_RULES } from "@/states/tanstackQuery/queryConstants";
import type { ScopeType } from "@/types/expenseTypes";

interface ScopePreviewOptions {
  id: string;
  /** 고른 범위. N이 비었거나 틀려 미리볼 수 없으면 null (요청하지 않는다) */
  scope: ScopeType | null;
  /** 수정에서 바꾼 날짜 */
  date?: string;
}

// 값이 delay 동안 그대로면 그 값을 돌려준다 (N을 치는 동안 요청을 쌓지 않는다)
const useSettledValue = <TValue>(value: TValue, delay: number) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
};

/**
 * 반복 기록 범위 미리보기 (화면 명세 SC-09, `GET /api/expenses/:id/scope`).
 * N은 입력을 멈춘 뒤 요청한다. 시트를 열 때마다 새로 받는다
 */
export const useScopePreview = ({ id, scope, date }: ScopePreviewOptions) => {
  const key = scope && {
    type: scope.type,
    n: scope.type === "count" ? scope.n : null,
  };
  // 범위 종류를 바꾼 것은 바로, N을 치는 것은 멈춘 뒤 요청한다
  const settledN = useSettledValue(
    key?.n ?? null,
    QUERY_RULES.scopePreviewDelay,
  );
  const ready = key !== null && key.n === settledN;

  return useQuery({
    queryKey: [QUERY_KEYS.scopePreview, id, key?.type, settledN, date],
    queryFn: () => getScopePreview(id, scope as ScopeType, date),
    enabled: ready,
    staleTime: 0,
    gcTime: 0,
  });
};
