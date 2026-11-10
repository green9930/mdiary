"use client";

import {
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type SyntheticEvent,
  useId,
  useRef,
  useState,
} from "react";

import { useHistoryLayer } from "@/hooks/useHistoryLayer";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useModalDialog } from "@/hooks/useModalDialog";

// 아래로 이만큼(시트 높이 대비) 끌거나 빠르게 튕기면 닫는다
const CLOSE_RATIO = 0.25;
const CLOSE_VELOCITY = 0.5; // px/ms
const SHEET_DURATION = 250; // globals.css --duration-sheet

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 시트 아래 고정 영역 ([적용] 등). 내용이 길어 스크롤돼도 보인다 */
  footer?: ReactNode;
}

// 바텀시트 (와이어프레임 CG ⑦, 토큰 5-6).
// 높이는 내용만큼, 최대 화면의 90%. 닫기: 아래로 끌기 · 바깥 탭 · 뒤로 가기 (Esc 포함)
const BottomSheet = ({
  open,
  onClose,
  title,
  children,
  footer,
}: BottomSheetProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const drag = useRef<{ startY: number; startTime: number } | null>(null);
  const [dragY, setDragY] = useState(0);
  const keyboardInset = useKeyboardInset(open);

  useModalDialog(ref, open, { closeDelay: SHEET_DURATION, focusSelf: true });
  useHistoryLayer(open, "close", onClose);

  // Esc: 브라우저가 바로 닫지 않게 하고 onClose로 넘긴다 (닫힘 움직임·기록 정리)
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  // 시트 판 바깥(가림막)을 누르면 <dialog> 자신이 눌린다
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startTime: performance.now() };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setDragY(Math.max(0, event.clientY - drag.current.startY));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const distance = Math.max(0, event.clientY - drag.current.startY);
    const elapsed = Math.max(1, performance.now() - drag.current.startTime);
    const height = ref.current?.offsetHeight ?? 1;
    drag.current = null;
    setDragY(0);
    if (
      distance > height * CLOSE_RATIO ||
      (distance > 0 && distance / elapsed > CLOSE_VELOCITY)
    ) {
      onClose();
    }
  };

  return (
    // 끄는 동안은 transition-none으로 손가락을 바로 따라간다
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      tabIndex={-1}
      onCancel={handleCancel}
      onClick={handleClick}
      style={{
        marginBottom: keyboardInset || undefined,
        translate: dragY ? `0 ${dragY}px` : undefined,
      }}
      className={`mx-auto mt-auto mb-0 hidden max-h-9/10 w-full max-w-120 flex-col overflow-visible bg-transparent p-0 text-text01 outline-none backdrop:bg-scrim open:flex data-closing:translate-y-full data-opening:translate-y-full ${
        dragY > 0
          ? "transition-none"
          : "transition-[translate] duration-(--duration-sheet) ease-out motion-reduce:transition-none"
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-t-sheet bg-bg shadow-sheet dark:border dark:border-b-0 dark:border-line">
        {/* 끌기 영역: 손잡이와 제목 */}
        <div
          data-testid="sheet-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className="shrink-0 cursor-grab touch-none px-4 pt-2.5 pb-3 select-none"
        >
          <div className="mx-auto h-1 w-9 rounded-full bg-line-strong" />
          <h2 id={titleId} className="pt-3 text-title-md">
            {title}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          {children}
        </div>
        {footer && <div className="shrink-0 px-4 pb-4">{footer}</div>}
        <div className="shrink-0 pb-safe" />
      </div>
    </dialog>
  );
};

export default BottomSheet;
