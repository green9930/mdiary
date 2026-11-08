import { useEffect, useState } from "react";

/**
 * 화면 아래를 가린 키보드 높이(px). 키보드가 없으면 0.
 * 바텀시트를 키보드 위로 올릴 때 쓴다 (화면 명세 공통 규약 · 다이얼로그, 바텀시트)
 */
export const useKeyboardInset = (active: boolean) => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;
    const update = () => {
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      setInset(0);
    };
  }, [active]);

  return inset;
};
