import { useQuery } from "@tanstack/react-query";

import { getExpense } from "@/api/expenseAPIs";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

interface ExpenseDetailOptions {
  /** 끄면 요청하지 않는다 (삭제 직후 무효화로 다시 불러오지 않게) */
  enabled?: boolean;
}

/** 기록 1건 + 반복 정보 (화면 명세 SC-08 상세, SC-06 수정). id가 없으면 요청하지 않는다 */
export const useExpenseDetail = (
  id: string | null,
  { enabled = true }: ExpenseDetailOptions = {},
) =>
  useQuery({
    queryKey: [QUERY_KEYS.expenseDetail, id],
    queryFn: () => getExpense(id ?? ""),
    enabled: id !== null && enabled,
    // 다른 기록의 내용을 잠깐이라도 보여 주지 않는다
    placeholderData: undefined,
  });
