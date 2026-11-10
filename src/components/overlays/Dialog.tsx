"use client";

import { type ReactNode, type SyntheticEvent, useId, useRef } from "react";

import Button from "@/components/elements/Button";
import { useHistoryLayer } from "@/hooks/useHistoryLayer";
import { useModalDialog } from "@/hooks/useModalDialog";
import type { ButtonVariantType } from "@/types/styleTypes";

interface DialogProps {
  open: boolean;
  title?: string;
  /** 본문. 제목이 없으면 본문이 주 문구라 text01 색으로 보인다 */
  children: ReactNode;
  confirmLabel: string;
  confirmVariant?: Extract<ButtonVariantType, "primary" | "danger" | "gray">;
  onConfirm: () => void;
  /** 있으면 확인 다이얼로그(버튼 2개), 없으면 알림 다이얼로그(버튼 1개) */
  cancelLabel?: string;
  cancelVariant?: Extract<ButtonVariantType, "line" | "primary" | "gray">;
  onCancel?: () => void;
  /** 실행 요청 중: 실행 버튼은 스피너, 취소도 막는다 */
  loading?: boolean;
}

// 확인·알림 다이얼로그 (와이어프레임 CG ⑧, 토큰 5-6).
// 버튼으로만 닫힌다: 바깥 탭·Esc·뒤로 가기로는 닫히지 않는다
const Dialog = ({
  open,
  title,
  children,
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  cancelLabel,
  cancelVariant = "line",
  onCancel,
  loading = false,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useModalDialog(ref, open, { focusSelf: true });
  useHistoryLayer(open, "block");

  // Esc: 막는다. 브라우저가 막기를 무시하고 닫으면(Esc 연타) 다시 연다
  const keepOpen = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
  };
  const reopen = () => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  };

  return (
    // 폭: 화면 − 48, 최대 320 (바깥 여백 24 + 안쪽 판)
    <dialog
      ref={ref}
      role="alertdialog"
      tabIndex={-1}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={bodyId}
      onCancel={keepOpen}
      onClose={reopen}
      className="m-auto w-full max-w-92 bg-transparent px-6 text-text01 transition-opacity duration-(--duration-dialog) outline-none backdrop:bg-scrim data-opening:opacity-0"
    >
      <div className="rounded-lg bg-bg px-4.5 pt-5.5 pb-4 shadow-2 dark:border dark:border-line">
        {title && (
          <h2 id={titleId} className="mb-1.5 text-center text-title-md">
            {title}
          </h2>
        )}
        <div
          id={bodyId}
          className={`mb-4.5 text-center text-body ${
            title ? "text-text02" : "text-text01"
          }`}
        >
          {children}
        </div>
        {/* 버튼이 둘이면 같은 폭으로 나눈다 */}
        <div className="grid auto-cols-fr grid-flow-col gap-2">
          {cancelLabel && (
            <Button
              variant={cancelVariant}
              disabled={loading}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={confirmVariant}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default Dialog;
