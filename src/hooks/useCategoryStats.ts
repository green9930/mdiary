import { useQuery } from "@tanstack/react-query";

import { getCategoryStats } from "@/api/statsAPIs";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";
import type { Period } from "@/types/expenseTypes";

/**
 * 기간의 총지출·건수와 카테고리별 합계 (화면 명세 SC-04).
 * 기간을 바꾸면 이전 기간의 값을 보여준 채 갱신한다 (앱 기본값)
 */
export const useCategoryStats = ({ from, to }: Period) =>
  useQuery({
    queryKey: [QUERY_KEYS.categoryStats, from, to],
    queryFn: () => getCategoryStats({ from, to }),
  });
