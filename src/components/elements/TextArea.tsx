"use client";

import { type ReactNode, useId, useLayoutEffect, useRef } from "react";

import CharCounter from "@/components/elements/CharCounter";
import Field, { fieldMessageId } from "@/components/elements/Field";
import {
  inputBoxClass,
  inputControlClass,
} from "@/components/elements/inputBoxStyles";
import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { clampChars, countChars } from "@/lib/text";

interface TextAreaProps {
  value: string;
  onValueChange: (value: string) => void;
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  /** 글자 수 한도. 있으면 카운터를 보여 주고 한도에서 입력을 막는다 */
  maxLength?: number;
  /** 없으면 자동으로 만든다. 라벨·오류 문구 연결에 쓴다 */
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 칸을 벗어날 때 (벗어날 때마다 검증하는 폼에서 쓴다) */
  onBlur?: () => void;
}

// 여러 줄 입력 (토큰 5-2): 3줄(본문 높이 72)에서 6줄까지 늘어나고, 그 뒤로는 안에서 스크롤한다
const TextArea = ({
  value,
  onValueChange,
  label,
  error,
  hint,
  maxLength,
  id,
  placeholder,
  disabled = false,
  onBlur,
}: TextAreaProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const ref = useRef<HTMLTextAreaElement>(null);
  const handlers = useNormalizedInput<HTMLTextAreaElement>(
    onValueChange,
    (v) => (maxLength === undefined ? v : clampChars(v, maxLength)),
  );

  // 내용 높이에 맞춘다. 최소·최대 높이는 클래스(min-h-18 · max-h-36)가 정한다
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <Field id={inputId} label={label} error={error} hint={hint}>
      <div
        className={`relative items-start pt-3 ${
          maxLength === undefined ? "pb-3" : "pb-6.5"
        } ${inputBoxClass({ invalid: !!error, disabled })}`}
      >
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          rows={3}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={`max-h-36 min-h-18 resize-none ${inputControlClass}`}
          onBlur={onBlur}
          onChange={handlers.onChange}
          onCompositionStart={handlers.onCompositionStart}
          onCompositionEnd={handlers.onCompositionEnd}
        />
        {maxLength !== undefined && (
          <span className="absolute right-3 bottom-1.5">
            <CharCounter count={countChars(value)} max={maxLength} />
          </span>
        )}
      </div>
    </Field>
  );
};

export default TextArea;
