"use client";

import { type InputHTMLAttributes, type ReactNode, useId } from "react";

import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { cn } from "@/lib/cn";
import { clampChars, countChars } from "@/lib/text";

import CharCounter from "./CharCounter";
import Field, { fieldMessageId } from "./Field";
import { inputBoxClass, inputControlClass } from "./inputBoxStyles";

interface TextInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "maxLength"
> {
  value: string;
  onValueChange: (value: string) => void;
  label?: ReactNode;
  /** 오류 문구. 있으면 오류 테두리와 함께 입력칸 아래에 보인다 */
  error?: string;
  hint?: ReactNode;
  /** 글자 수 한도. 있으면 카운터를 보여 주고 한도에서 입력을 막는다 */
  maxLength?: number;
  /** 입력칸 오른쪽 안쪽의 단위 (원·개월·회) */
  unit?: string;
  /** 단위·카운터 뒤에 붙는 요소 (검색 지우기 버튼 등) */
  trailing?: ReactNode;
}

// 한 줄 텍스트 입력 (와이어프레임 CG ②③, 토큰 5-2)
const TextInput = ({
  value,
  onValueChange,
  label,
  error,
  hint,
  maxLength,
  unit,
  trailing,
  id,
  disabled = false,
  className,
  ...props
}: TextInputProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const handlers = useNormalizedInput<HTMLInputElement>(onValueChange, (v) =>
    maxLength === undefined ? v : clampChars(v, maxLength),
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
        className={cn("h-12", inputBoxClass({ invalid: !!error, disabled }))}
      >
        <input
          id={inputId}
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={cn("h-full", inputControlClass)}
          {...handlers}
          {...props}
        />
        {unit && <span className="shrink-0 text-text-sub">{unit}</span>}
        {maxLength !== undefined && (
          <CharCounter count={countChars(value)} max={maxLength} />
        )}
        {trailing}
      </div>
    </Field>
  );
};

export default TextInput;
