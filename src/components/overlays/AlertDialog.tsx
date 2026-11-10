import type { ReactNode } from "react";

import Dialog from "@/components/overlays/Dialog";
import { BTN_TEXTS } from "@/shared/sharedConstants";

interface AlertDialogProps {
  open: boolean;
  title: string;
  children: ReactNode; // 본문
  onClose: () => void;
}

// 알림 다이얼로그 (와이어프레임 CM ⑤⑥): 저장·삭제 실패 등. [확인] 하나로만 닫힌다
const AlertDialog = ({ open, title, children, onClose }: AlertDialogProps) => {
  return (
    <Dialog
      open={open}
      title={title}
      confirmLabel={BTN_TEXTS.confirm}
      onConfirm={onClose}
    >
      {children}
    </Dialog>
  );
};

export default AlertDialog;
