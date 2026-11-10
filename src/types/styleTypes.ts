/** 버튼 종류. disabled·textDisabled는 비활성 모양만 입힌다 (disabled 속성과 달리 눌린다) */
export type ButtonVariantType =
  | "primary"
  | "secondary"
  | "outline"
  | "line"
  | "text"
  | "danger"
  | "gray"
  | "disabled"
  | "textDisabled";

export type ButtonSizeType = "lg" | "md" | "sm";
