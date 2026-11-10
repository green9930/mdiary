"use client";

import { type ReactNode, useId } from "react";

import CharCounter from "@/components/elements/CharCounter";
import Field, { fieldMessageId } from "@/components/elements/Field";
import {
  inputBoxClass,
  inputControlClass,
} from "@/components/elements/inputBoxStyles";
import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { cn } from "@/lib/cn";
import { clampChars, countChars } from "@/lib/text";

interface TextInputProps {
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
  /** 숫자 키패드를 띄우고 입력값을 숫자 글꼴(Rubik)로 보인다 (금액) */
  numeric?: boolean;
  /** 없으면 자동으로 만든다. 라벨·오류 문구 연결에 쓴다 */
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 칸을 벗어날 때 (벗어날 때마다 검증하는 폼에서 쓴다) */
  onBlur?: () => void;
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
  numeric = false,
  id,
  placeholder,
  disabled = false,
  onBlur,
}: TextInputProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const handlers = useNormalizedInput<HTMLInputElement>(onValueChange, (v) =>
    maxLength === undefined ? v : clampChars(v, maxLength),
  );

  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <div
        className={`h-12 items-center ${inputBoxClass({ invalid: !!error, disabled })}`}
      >
        <input
          id={inputId}
          value={value}
          placeholder={placeholder}
          inputMode={numeric ? "numeric" : undefined}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={cn("h-full", numeric && "font-num", inputControlClass)}
          onBlur={onBlur}
          onChange={handlers.onChange}
          onCompositionStart={handlers.onCompositionStart}
          onCompositionEnd={handlers.onCompositionEnd}
        />
        {unit && <span className="shrink-0 text-text02">{unit}</span>}
        {maxLength !== undefined && (
          <CharCounter count={countChars(value)} max={maxLength} />
        )}
        {trailing}
      </div>
    </Field>
  );
};

export default TextInput;
