import { useEffect, useState } from "react";

import { useGoBack } from "@/hooks/useGoBack";
import { runAfterLayerPops, useHistoryLayer } from "@/hooks/useHistoryLayer";

/**
 * 작성 중 나가기 확인 (화면 명세 SC-06). 입력한 내용이 있으면 [뒤로]·브라우저 뒤로 가기에 확인 다이얼로그를 띄운다.
 * 브라우저 뒤로 가기는 같은 주소로 기록을 하나 쌓아 가로챈다. 화면을 옮길 때는 leaveWith로 그 기록을 먼저 되돌린다
 */
export const useLeaveGuard = (dirty: boolean) => {
  const goBack = useGoBack();
  const [confirming, setConfirming] = useState(false);
  const [exit, setExit] = useState<(() => void) | null>(null);

  useHistoryLayer(dirty && !confirming && !exit, "close", () =>
    setConfirming(true),
  );

  // 가로채기·다이얼로그가 쌓은 기록이 되돌려진 뒤에 옮긴다. 먼저 옮기면 바뀐 주소의 기록이 되돌려진다
  useEffect(() => {
    if (exit) runAfterLayerPops(exit);
  }, [exit]);

  /** 쌓은 기록을 정리한 뒤 navigate로 화면을 옮긴다 (저장 성공, [나가기]) */
  const leaveWith = (navigate: () => void) => {
    setExit(() => navigate);
  };

  return {
    /** [뒤로]: 입력한 내용이 있으면 확인 다이얼로그, 없으면 이전 화면 */
    requestLeave: () => (dirty ? setConfirming(true) : goBack()),
    leaveWith,
    confirmOpen: confirming && !exit,
    keepWriting: () => setConfirming(false),
    leave: () => leaveWith(goBack),
  };
};
