import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

import Spinner from "./Spinner";

export type TButtonVariant =
  "primary" | "secondary" | "outline" | "line" | "text" | "danger" | "gray";

export type TButtonSize = "l" | "m" | "s";

// 종류별 면·글자·테두리와 누름 (토큰 5-1)
const VARIANT_CLASSES: Record<TButtonVariant, string> = {
  primary: "bg-primary text-on-primary active:bg-primary-pressed",
  secondary: "bg-tint text-on-tint active:bg-tint-pressed",
  outline: "border-accent bg-bg text-accent active:bg-surface",
  line: "border-line-strong bg-bg text-text active:bg-surface",
  text: "px-1 font-medium text-text underline underline-offset-3 active:text-text-sub",
  danger: "bg-danger text-on-danger active:bg-danger-pressed",
  gray: "bg-gray text-on-gray active:bg-gray-pressed",
};

// 비활성은 종류와 상관없이 disabled 모양 (text는 글자색만)
const DISABLED_CLASSES: Record<TButtonVariant, string> = {
  ...Object.fromEntries(
    Object.keys(VARIANT_CLASSES).map((v) => [
      v,
      "bg-disabled text-on-disabled",
    ]),
  ),
  text: "px-1 font-medium text-on-disabled underline underline-offset-3",
} as Record<TButtonVariant, string>;

// L 52 (하단 고정, 폭 전체) · M 44 · S 32. S도 누르는 영역은 44×44
const SIZE_CLASSES: Record<TButtonSize, string> = {
  l: "h-13 w-full rounded-md px-4 text-button-l",
  m: "h-11 rounded-md px-4 text-body font-bold",
  s: "touch-44 h-8 rounded-sm px-2.5 text-caption font-bold",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
  /** 요청 중: 글자 대신 스피너를 보여 주고 누를 수 없다. 색은 그대로 */
  loading?: boolean;
}

// 버튼 (와이어프레임 CG ①, 토큰 5-1)
const Button = ({
  variant = "primary",
  size = "m",
  loading = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 border-2 border-transparent whitespace-nowrap select-none",
        SIZE_CLASSES[size],
        disabled ? DISABLED_CLASSES[variant] : VARIANT_CLASSES[variant],
        loading && "pointer-events-none",
        className,
      )}
      {...props}
    >
      {/* 요청 중에도 버튼 폭이 바뀌지 않도록 글자는 자리만 남긴다 */}
      <span
        className={cn(
          "inline-flex items-center gap-1.5",
          loading && "invisible",
        )}
      >
        {children}
      </span>
      {loading && <Spinner className="absolute" />}
    </button>
  );
};

export default Button;
