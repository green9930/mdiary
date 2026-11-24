import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteExpense } from "@/api/expenseAPIs";
import { invalidateExpenseQueries } from "@/states/tanstackQuery/invalidateExpenseQueries";

/** 기록 삭제, 이 건만 (화면 명세 SC-08). 성공하면 지출 관련 조회를 모두 다시 불러오게 한다 */
export const useDeleteExpense = (id: string) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => deleteExpense(id),
    onSuccess: () => invalidateExpenseQueries(client),
  });
};
