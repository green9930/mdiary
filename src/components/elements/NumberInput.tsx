"use client";

import { type ReactNode, useId } from "react";

import Field, { fieldMessageId } from "@/components/elements/Field";
import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { toDigits } from "@/lib/text";
import {
  INPUT_BOX_CLASS,
  INPUT_CONTROL_CLASS,
  INPUT_SIZE_CLASSES,
  INPUT_STATE_CLASSES,
  NUMBER_INPUT_UNIT_CLASSES,
  NUMBER_INPUT_WIDTH_CLASS,
} from "@/shared/styleConstants";
import type { InputSizeType } from "@/types/styleTypes";

interface NumberInputProps {
  /** 숫자만 담은 문자열. 비어 있을 수 있다 */
  value: string;
  onValueChange: (value: string) => void;
  /** 입력칸 오른쪽 안쪽에 고정으로 보이는 단위 (개월·회) */
  unit: string;
  label?: ReactNode;
  /** 보이는 라벨 없이 쓸 때의 접근성 이름 */
  "aria-label"?: string;
  error?: string;
  hint?: ReactNode;
  /** 최대 자릿수 */
  maxDigits?: number;
  /** 높이: lg 48 (기본) · md 40 */
  size?: InputSizeType;
  /** 없으면 자동으로 만든다. 라벨·오류 문구 연결에 쓴다 */
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 칸을 벗어날 때 (벗어날 때마다 검증하는 폼에서 쓴다) */
  onBlur?: () => void;
}

// 개월 수·회차 입력 (와이어프레임 CG ⑤): 숫자 키패드, 숫자만, 맨 앞 0 지움, 붙여넣기는 숫자만 골라 자른다
const NumberInput = ({
  value,
  onValueChange,
  unit,
  label,
  "aria-label": ariaLabel,
  error,
  hint,
  maxDigits = 2,
  size = "lg",
  id,
  placeholder,
  disabled = false,
  onBlur,
}: NumberInputProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const handlers = useNormalizedInput<HTMLInputElement>(onValueChange, (v) =>
    toDigits(v, maxDigits),
  );

  const state = disabled ? "disabled" : error ? "invalid" : "default";

  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <div
        className={`${INPUT_BOX_CLASS} ${INPUT_SIZE_CLASSES[size]} ${NUMBER_INPUT_WIDTH_CLASS} items-center ${INPUT_STATE_CLASSES[state]}`}
      >
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={`h-full font-num ${INPUT_CONTROL_CLASS}`}
          onBlur={onBlur}
          onChange={handlers.onChange}
          onCompositionStart={handlers.onCompositionStart}
          onCompositionEnd={handlers.onCompositionEnd}
        />
        <span
          className={`shrink-0 text-text02 ${NUMBER_INPUT_UNIT_CLASSES[size]}`}
        >
          {unit}
        </span>
      </div>
    </Field>
  );
};

export default NumberInput;
