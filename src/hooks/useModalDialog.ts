import { type RefObject, useEffect } from "react";

/**
 * open에 맞춰 <dialog>를 모달로 열고 닫는다. 브라우저가 맨 위 표시·포커스 가두기·배경 막기를 해 준다.
 * closeDelay: 닫힘 움직임을 보여 줄 시간(ms). 움직임 줄이기 설정이면 바로 닫는다
 */
export const useModalDialog = (
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
  closeDelay = 0,
) => {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      delete dialog.dataset.closing;
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (!dialog.open) return;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!closeDelay || reduce) {
      dialog.close();
      return;
    }
    dialog.dataset.closing = "";
    const timer = window.setTimeout(() => {
      delete dialog.dataset.closing;
      dialog.close();
    }, closeDelay);
    return () => window.clearTimeout(timer);
  }, [ref, open, closeDelay]);
};
