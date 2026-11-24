import { useEffect, useState } from "react";

import { useGoBack } from "@/hooks/useGoBack";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";

/**
 * 작성 중 나가기 확인 (화면 명세 SC-06). 입력한 내용이 있으면 상단 [뒤로]에 확인 다이얼로그를 띄운다.
 * 브라우저·기기의 뒤로 가기는 가로채지 않는다 (확인 없이 이전 화면으로 간다).
 * [나가기]는 다이얼로그가 쌓은 기록을 먼저 되돌린 뒤 이전 화면으로 간다
 */
export const useLeaveGuard = (dirty: boolean) => {
  const goBack = useGoBack();
  const [confirming, setConfirming] = useState(false);
  const [exit, setExit] = useState<(() => void) | null>(null);

  // 다이얼로그가 쌓은 기록이 되돌려진 뒤에 옮긴다. 먼저 옮기면 바뀐 주소의 기록이 되돌려진다
  useEffect(() => {
    if (exit) runAfterLayerPops(exit);
  }, [exit]);

  return {
    /** [뒤로]: 입력한 내용이 있으면 확인 다이얼로그, 없으면 이전 화면 */
    requestLeave: () => (dirty ? setConfirming(true) : goBack()),
    confirmOpen: confirming && !exit,
    keepWriting: () => setConfirming(false),
    /** [나가기]: 쌓은 기록을 정리한 뒤 이전 화면으로 간다 */
    leave: () => setExit(() => goBack),
  };
};
