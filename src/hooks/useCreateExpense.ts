import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postExpense } from "@/api/expenseAPIs";
import { invalidateExpenseQueries } from "@/states/tanstackQuery/invalidateExpenseQueries";

/**
 * 지출 등록. 성공하면 지출과 관련된 조회를 모두 다시 불러오게 한다 (데이터 아키텍처 8-4).
 * 다시 불러오기를 기다리지 않는다 (저장 뒤 폼에 남아 다음 기록을 받는다)
 */
export const useCreateExpense = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: postExpense,
    onSuccess: () => invalidateExpenseQueries(client),
  });
};
