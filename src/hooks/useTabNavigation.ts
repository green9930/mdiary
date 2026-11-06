import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { todayInSeoul } from "@/lib/date";
import { PATHS, type Tab, TABS_LIST } from "@/shared/sharedConstants";

/** 경로가 속한 탭. 하위 경로도 그 탭으로 본다 */
const findTab = (pathname: string): Tab | undefined =>
  TABS_LIST.find((tab) =>
    tab.path === "/"
      ? pathname === "/"
      : pathname === tab.path || pathname.startsWith(`${tab.path}/`),
  );

// 탭마다 마지막으로 본 주소. 다른 탭에 갔다 돌아오면 이 주소로 간다.
// 조회 조건이 URL에 있으므로 주소만 기억하면 기간·필터·검색어가 유지된다.
const lastUrls = new Map<string, string>();

/** 테스트용 */
export const clearTabUrls = () => {
  lastUrls.clear();
};

/** 하단 탭 바의 이동 (화면 명세 SC-01): 현재 탭과 각 버튼이 갈 주소 */
export const useTabNavigation = () => {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const url = search ? `${pathname}?${search}` : pathname;
  const current = findTab(pathname);

  useEffect(() => {
    if (current) lastUrls.set(current.path, url);
  }, [current, url]);

  // 현재 탭을 다시 누르면 기본 상태, 다른 탭은 마지막으로 본 상태
  const tabHref = (tab: Tab) =>
    tab === current ? tab.path : (lastUrls.get(tab.path) ?? tab.path);

  // F3: 달력에서 날짜를 골라둔 상태면 그 날짜를 쓴다
  const newExpenseHref = `${PATHS.newExpense}?date=${todayInSeoul()}`;

  return { current, tabHref, newExpenseHref };
};
