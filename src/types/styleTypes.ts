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

/** 한 줄 입력 크기: lg 48 · md 40 (토큰 5-2) */
export type InputSizeType = "lg" | "md";

/** 로고 크기: 로그인 화면 lg, 그 밖 md (토큰 5-7) */
export type LogoSizeType = "lg" | "md";
