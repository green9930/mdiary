import { type ChangeEvent, type CompositionEvent, useRef } from "react";

type TInputElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * 입력값을 normalize(한도 자르기, 숫자만 고르기)한 뒤 넘긴다.
 * 한글을 조합하는 중에는 자르지 않고, 조합이 끝나면 자른다 (조합 중에 자르면 글자가 깨진다)
 */
export const useNormalizedInput = <T extends TInputElement>(
  onValueChange: (value: string) => void,
  normalize: (value: string) => string,
) => {
  const composing = useRef(false);

  return {
    onChange: (event: ChangeEvent<T>) => {
      const { value } = event.target;
      onValueChange(composing.current ? value : normalize(value));
    },
    onCompositionStart: () => {
      composing.current = true;
    },
    onCompositionEnd: (event: CompositionEvent<T>) => {
      composing.current = false;
      onValueChange(normalize(event.currentTarget.value));
    },
  };
};
