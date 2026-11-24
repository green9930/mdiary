import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchExpense } from "@/api/expenseAPIs";
import { invalidateExpenseQueries } from "@/states/tanstackQuery/invalidateExpenseQueries";
import type { UpdateExpenseRequestType } from "@/types/expenseTypes";

/** 기록 수정 (화면 명세 SC-06 수정). 성공하면 지출 관련 조회를 모두 다시 불러오게 한다 */
export const useUpdateExpense = (id: string) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateExpenseRequestType) =>
      patchExpense(id, request),
    onSuccess: () => invalidateExpenseQueries(client),
  });
};
