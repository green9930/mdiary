import type { QueryClient } from "@tanstack/react-query";

import { EXPENSE_QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

/** 등록·수정·삭제가 성공하면 지출과 관련된 조회를 모두 다시 불러오게 한다 (데이터 아키텍처 8-4) */
export const invalidateExpenseQueries = (client: QueryClient) => {
  for (const key of EXPENSE_QUERY_KEYS) {
    void client.invalidateQueries({ queryKey: [key] });
  }
};
