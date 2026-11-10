"use client";

import { type ReactNode, useId } from "react";

import Field, { fieldMessageId } from "@/components/elements/Field";
import {
  inputBoxClass,
  inputControlClass,
} from "@/components/elements/inputBoxStyles";
import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { toDigits } from "@/lib/text";

interface NumberInputProps {
  /** 숫자만 담은 문자열. 비어 있을 수 있다 */
  value: string;
  onValueChange: (value: string) => void;
  /** 입력칸 오른쪽 안쪽에 고정으로 보이는 단위 (개월·회) */
  unit: string;
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  /** 최대 자릿수 */
  maxDigits?: number;
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
  error,
  hint,
  maxDigits = 2,
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

  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <div
        className={`h-12 w-28 items-center ${inputBoxClass({ invalid: !!error, disabled })}`}
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
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={`h-full font-num ${inputControlClass}`}
          onBlur={onBlur}
          onChange={handlers.onChange}
          onCompositionStart={handlers.onCompositionStart}
          onCompositionEnd={handlers.onCompositionEnd}
        />
        <span className="shrink-0 text-text02">{unit}</span>
      </div>
    </Field>
  );
};

export default NumberInput;
