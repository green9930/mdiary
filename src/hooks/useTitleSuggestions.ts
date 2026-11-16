import { useQuery } from "@tanstack/react-query";

import { getTitles } from "@/api/expenseAPIs";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

/** 자주 쓴 제목. 등록 화면에 들어올 때 한 번 받는다 (화면 명세 SC-06) */
export const useTitleSuggestions = () =>
  useQuery({ queryKey: [QUERY_KEYS.titleSuggestions], queryFn: getTitles });
