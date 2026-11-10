import type { AriaAttributes, ReactNode } from "react";

import Spinner from "@/components/elements/Spinner";
import { cn } from "@/lib/cn";
import type { ButtonSizeType, ButtonVariantType } from "@/types/styleTypes";

// text 버튼은 면 없이 밑줄 글자 (활성·비활성 공통). 안쪽 여백·굵기도 크기와 상관없이 같다
const TEXT_BASE_CLASS =
  "border-transparent px-1 font-medium underline underline-offset-3";

// 종류별 면·글자·테두리와 누름 (토큰 5-1).
// 비활성은 종류와 상관없이 disabled 모양, text만 면 없이 글자색만 바뀐다 (textDisabled)
const VARIANT_CLASSES: Record<ButtonVariantType, string> = {
  primary:
    "border-transparent bg-primary text-on-primary active:bg-primary-pressed",
  secondary: "border-transparent bg-tint text-on-tint active:bg-tint-pressed",
  outline: "border-accent bg-bg text-accent active:bg-surface",
  line: "border-line-strong bg-bg text-text01 active:bg-surface",
  text: `${TEXT_BASE_CLASS} text-text01 active:text-text02`,
  danger:
    "border-transparent bg-danger text-on-danger active:bg-danger-pressed",
  gray: "border-transparent bg-gray text-on-gray active:bg-gray-pressed",
  disabled: "border-transparent bg-disabled text-on-disabled",
  textDisabled: `${TEXT_BASE_CLASS} text-on-disabled`,
};

// lg 48 (하단 고정, 폭 전체) · md 40 · sm 32. md·sm도 누르는 영역은 44×44
const SIZE_CLASSES: Record<ButtonSizeType, string> = {
  lg: "h-12 w-full rounded-md text-button-lg",
  md: "touch-44 h-10 rounded-md text-body",
  sm: "touch-44 h-8 rounded-sm text-caption",
};

// text가 아닌 버튼의 크기별 안쪽 여백·굵기 (lg 굵기는 text-button-lg에 들어 있다)
const PADDING_CLASSES: Record<ButtonSizeType, string> = {
  lg: "px-4",
  md: "px-4 font-bold",
  sm: "px-2.5 font-bold",
};

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
        "relative inline-flex items-center justify-center gap-1.5 border whitespace-nowrap select-none",
        SIZE_CLASSES[size],
        !isText && PADDING_CLASSES[size],
        VARIANT_CLASSES[style],
        loading && "pointer-events-none",
      )}
    >
      {/* 요청 중에도 버튼 폭이 바뀌지 않도록 글자는 자리만 남긴다 */}
      <span
        className={cn("inline-flex items-center gap-1", loading && "invisible")}
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
