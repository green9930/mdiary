import { useQuery } from "@tanstack/react-query";

import { getDayExpenses } from "@/api/expenseAPIs";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

/** 선택한 날짜의 기록 목록, 등록 순 (화면 명세 SC-03) */
export const useDayExpenses = (date: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.dayExpenses, date],
    queryFn: () => getDayExpenses(date),
  });
