// 컴포넌트 모양 클래스 (토큰 5장)

import type {
  ButtonSizeType,
  ButtonVariantType,
  InputSizeType,
} from "@/types/styleTypes";

// text 버튼은 면 없이 밑줄 글자 (활성·비활성 공통). 안쪽 여백·굵기도 크기와 상관없이 같다
const BUTTON_TEXT_BASE_CLASS =
  "border-transparent px-1 font-medium underline underline-offset-3";

/** 버튼 공통 (토큰 5-1) */
export const BUTTON_BASE_CLASS =
  "relative inline-flex items-center justify-center gap-1.5 border whitespace-nowrap select-none";

/**
 * 버튼 종류별 면·글자·테두리와 누름 (토큰 5-1).
 * 비활성은 종류와 상관없이 disabled 모양, text만 면 없이 글자색만 바뀐다 (textDisabled)
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariantType, string> = {
  primary: "border-transparent bg-primary text-white active:bg-primary-pressed",
  secondary: "border-transparent bg-tint text-on-tint active:bg-tint-pressed",
  outline: "border-accent bg-bg text-accent active:bg-surface",
  line: "border-line-strong bg-bg text-text01 active:bg-surface",
  text: `${BUTTON_TEXT_BASE_CLASS} text-text01 active:text-text02`,
  danger: "border-transparent bg-danger text-white active:bg-danger-pressed",
  gray: "border-transparent bg-gray text-on-gray active:bg-gray-pressed",
  disabled: "border-transparent bg-disabled text-text03",
  textDisabled: `${BUTTON_TEXT_BASE_CLASS} text-text03`,
};

/** 버튼 크기: lg 48 (하단 고정, 폭 전체) · md 40 · sm 32. md·sm도 누르는 영역은 44×44 */
export const BUTTON_SIZE_CLASSES: Record<ButtonSizeType, string> = {
  lg: "h-12 w-full rounded-md text-button-lg",
  md: "touch-44 h-10 rounded-md text-body",
  sm: "touch-44 h-8 rounded-sm text-caption",
};

/** text가 아닌 버튼의 크기별 안쪽 여백·굵기 (lg 굵기는 text-button-lg에 들어 있다) */
export const BUTTON_PADDING_CLASSES: Record<ButtonSizeType, string> = {
  lg: "px-4",
  md: "px-4 font-bold",
  sm: "px-2.5 font-bold",
};

/**
 * 입력칸 바깥 상자 공통 (토큰 5-2). 세로 정렬은 쓰는 쪽이 정한다
 * (한 줄 입력 items-center, textarea items-start)
 */
export const INPUT_BOX_CLASS =
  "flex gap-2 rounded-md border px-3.5 text-body-lg";

/** 입력칸 상태별 테두리·면. 포커스·오류의 2px 테두리는 안쪽 outline으로 그려 크기가 변하지 않게 한다 */
export const INPUT_STATE_CLASSES = {
  default:
    "border-line-input bg-bg text-text01 focus-within:border-accent focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent",
  invalid:
    "border-danger-text bg-bg text-text01 outline-2 -outline-offset-2 outline-danger-text",
  disabled: "border-line bg-surface text-text03",
} as const;

/** 한 줄 입력(TextInput·NumberInput)의 크기별 높이. 글자는 iOS 확대를 막도록 크기와 상관없이 16 */
export const INPUT_SIZE_CLASSES: Record<InputSizeType, string> = {
  lg: "h-12",
  md: "h-10",
};

/** 입력칸 안의 실제 <input>·<textarea>: 테두리·면은 바깥 상자가 그린다 */
export const INPUT_CONTROL_CLASS =
  "min-w-0 flex-1 bg-transparent outline-none placeholder:text-text03 disabled:text-text03";

/** 숫자 입력 단위(개월·회)의 크기별 글자: lg 16 · md 14 */
export const NUMBER_INPUT_UNIT_CLASSES: Record<InputSizeType, string> = {
  lg: "text-body-lg",
  md: "text-body",
};

/** 숫자 입력 너비 (개월·회) */
export const NUMBER_INPUT_WIDTH_CLASS = "w-28";

/** 여러 줄 입력: 3줄(본문 높이 72)에서 6줄까지 늘어나고, 그 뒤로는 안에서 스크롤한다 */
export const TEXTAREA_CONTROL_CLASS = "max-h-36 min-h-18 resize-none";
