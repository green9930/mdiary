import type { AriaAttributes, ReactNode } from "react";

import Spinner from "@/components/elements/Spinner";
import { cn } from "@/lib/cn";
import {
  BUTTON_BASE_CLASS,
  BUTTON_PADDING_CLASSES,
  BUTTON_SIZE_CLASSES,
  BUTTON_VARIANT_CLASSES,
} from "@/shared/styleConstants";
import type { ButtonSizeType, ButtonVariantType } from "@/types/styleTypes";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  /** 폼 제출 버튼이면 submit */
  type?: "button" | "submit";
  disabled?: boolean;
  /** 요청 중: 글자 대신 스피너를 보여 주고 누를 수 없다. 색은 그대로 */
  loading?: boolean;
  onClick?: () => void;
  /** 글자와 다른 이름으로 읽어야 할 때 (드롭다운: "정렬: 최신순") */
  "aria-label"?: string;
  /** 메뉴를 여는 버튼 (드롭다운) */
  "aria-haspopup"?: AriaAttributes["aria-haspopup"];
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

// 버튼 (와이어프레임 CG ①, 토큰 5-1)
const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  children,
  onClick,
  "aria-label": ariaLabel,
  "aria-haspopup": ariaHaspopup,
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
}: ButtonProps) => {
  const isText = variant === "text" || variant === "textDisabled";
  const style = disabled ? (isText ? "textDisabled" : "disabled") : variant;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-busy={loading || undefined}
      className={cn(
        BUTTON_BASE_CLASS,
        BUTTON_SIZE_CLASSES[size],
        !isText && BUTTON_PADDING_CLASSES[size],
        BUTTON_VARIANT_CLASSES[style],
        loading && "pointer-events-none cursor-not-allowed",
      )}
    >
      {/* 요청 중에도 버튼 폭이 바뀌지 않도록 글자는 자리만 남긴다.
          invisible이 아닌 opacity-0: 스크린 리더가 버튼 이름을 계속 읽는다 */}
      <span
        className={cn("inline-flex items-center gap-1", loading && "opacity-0")}
      >
        {children}
      </span>
      {loading && (
        <span className="absolute grid">
          <Spinner />
        </span>
      )}
    </button>
  );
};

export default Button;
