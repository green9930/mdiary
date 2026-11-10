import { type RefObject, useEffect } from "react";

interface ModalDialogOptions {
  /** 닫힘 움직임을 보여 줄 시간(ms). 움직임 줄이기 설정이면 바로 닫는다 */
  closeDelay?: number;
  /** 열 때 첫 버튼 대신 <dialog> 자체에 포커스를 준다 (tabIndex={-1} 필요). 버튼에 포커스 테두리가 뜨지 않는다 */
  focusSelf?: boolean;
}

/**
 * open에 맞춰 <dialog>를 모달로 열고 닫는다. 브라우저가 맨 위 표시·포커스 가두기·배경 막기를 해 준다.
 * 열 때는 data-opening, 닫을 때는 data-closing을 붙여 움직임의 시작·끝 모양을 CSS로 정한다.
 */
export const useModalDialog = (
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
  { closeDelay = 0, focusSelf = false }: ModalDialogOptions = {},
) => {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      delete dialog.dataset.closing;
      if (!dialog.open) {
        dialog.dataset.opening = "";
        dialog.showModal();
        if (focusSelf) dialog.focus();
      }
      if (!("opening" in dialog.dataset)) return;
      // 시작 모양으로 한 번 그린 뒤 움직임을 시작한다. 첫 프레임이 늦게 그려져도(휴대폰·개발 모드) 열림 움직임이 보인다
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => delete dialog.dataset.opening);
      });
      return () => cancelAnimationFrame(frame);
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
  }, [ref, open, closeDelay, focusSelf]);
};
