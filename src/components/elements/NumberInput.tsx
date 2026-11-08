"use client";

import { type InputHTMLAttributes, type ReactNode, useId } from "react";

import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { cn } from "@/lib/cn";
import { toDigits } from "@/lib/text";

import Field, { fieldMessageId } from "./Field";
import { inputBoxClass, inputControlClass } from "./inputBoxStyles";

interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> {
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
  disabled = false,
  className,
  ...props
}: NumberInputProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const handlers = useNormalizedInput<HTMLInputElement>(onValueChange, (v) =>
    toDigits(v, maxDigits),
  );

  return (
    <Field
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      className={className}
    >
      <div
        className={cn(
          "h-12 w-28",
          inputBoxClass({ invalid: !!error, disabled }),
        )}
      >
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={cn("h-full font-num", inputControlClass)}
          {...handlers}
          {...props}
        />
        <span className="shrink-0 text-text-sub">{unit}</span>
      </div>
    </Field>
  );
};

export default NumberInput;
