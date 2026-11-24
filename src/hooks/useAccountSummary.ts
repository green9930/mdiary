import { useQuery } from "@tanstack/react-query";

import { getAccountSummary } from "@/api/accountAPIs";
import { QUERY_KEYS } from "@/states/tanstackQuery/queryConstants";

/** 계정 요약: 이메일·전체 건수 */
export const useAccountSummary = () =>
  useQuery({
    queryKey: [QUERY_KEYS.accountSummary],
    queryFn: getAccountSummary,
  });
