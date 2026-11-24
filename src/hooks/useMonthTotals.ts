import { noop, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getMonthTotals } from "@/api/calendarAPIs";
import { addMonths, isMaxMonth } from "@/lib/date";
import { QUERY_KEYS, QUERY_RULES } from "@/states/tanstackQuery/queryConstants";

const monthTotalsQuery = (month: string) => ({
  queryKey: [QUERY_KEYS.monthTotals, month],
  queryFn: () => getMonthTotals(month),
  // 스와이프할 때마다 다시 요청하지 않게 한다. 기록이 바뀌면 무효화로 다시 불러온다
  staleTime: QUERY_RULES.monthTotalsStaleTime,
});

/**
 * 한 달의 날짜별 합계·월 합계 (화면 명세 SC-03).
 * 스와이프 중 옆 달 금액이 보이도록 앞뒤 달을 미리 불러온다
 */
export const useMonthTotals = (month: string) => {
  const client = useQueryClient();

  // 미리 불러오기는 실패해도 화면에 알리지 않는다. 그 달로 옮기면 다시 불러온다
  useEffect(() => {
    client.query(monthTotalsQuery(addMonths(month, -1))).catch(noop);
    if (!isMaxMonth(month))
      client.query(monthTotalsQuery(addMonths(month, 1))).catch(noop);
  }, [client, month]);

  return useQuery({
    ...monthTotalsQuery(month),
    // 달을 옮기면 이전 달 금액을 지우고 날짜만 먼저 그린다 (화면 명세 SC-03 월 이동 중).
    // 앱 기본값(이전 데이터 유지)을 끈다
    placeholderData: undefined,
  });
};

/** 이미 불러온 달의 합계만 읽는다 (스와이프 중 보이는 옆 달). 새로 요청하지 않는다 */
export const useCachedMonthTotals = (month: string) =>
  useQuery({ ...monthTotalsQuery(month), enabled: false }).data;
