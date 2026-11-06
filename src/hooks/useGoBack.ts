import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { PATHS } from "@/shared/sharedConstants";

// 이 탭에서 앱을 연 뒤 앱 안에서 화면을 옮긴 적이 있는지.
// history.length는 앱에 들어오기 전 기록(다른 사이트, Google 로그인)까지 세어서 쓰지 않는다
let firstPath: string | null = null;
let hasInAppHistory = false;

/** 테스트용: 기록을 비운다 */
export const resetInAppHistory = () => {
  firstPath = null;
  hasInAppHistory = false;
};

/** 앱 안에서 화면을 옮겼는지 기록한다. 루트 레이아웃에서 한 번 쓴다 */
export const useTrackInAppHistory = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (firstPath === null) firstPath = pathname;
    else if (pathname !== firstPath) hasInAppHistory = true;
  }, [pathname]);
};

/** 이전 화면으로 간다. 앱 안에서 옮긴 적이 없으면(주소로 바로 들어옴, PWA 재실행) 달력으로 간다 */
export const useGoBack = () => {
  const router = useRouter();

  return () => {
    if (hasInAppHistory) router.back();
    else router.replace(PATHS.calendar);
  };
};
