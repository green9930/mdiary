"use client";

import {
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

import { useNormalizedInput } from "@/hooks/useNormalizedInput";
import { cn } from "@/lib/cn";
import { clampChars, countChars } from "@/lib/text";

import CharCounter from "./CharCounter";
import Field, { fieldMessageId } from "./Field";
import { inputBoxClass, inputControlClass } from "./inputBoxStyles";

interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "maxLength" | "rows"
> {
  value: string;
  onValueChange: (value: string) => void;
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  maxLength?: number;
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
  disabled = false,
  className,
  ...props
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
    <Field
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      className={className}
    >
      <div
        className={cn(
          "relative items-start pt-3",
          maxLength === undefined ? "pb-3" : "pb-6.5",
          inputBoxClass({ invalid: !!error, disabled }),
        )}
      >
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          rows={3}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? fieldMessageId(inputId) : undefined}
          className={cn("max-h-36 min-h-18 resize-none", inputControlClass)}
          {...handlers}
          {...props}
        />
        {maxLength !== undefined && (
          <CharCounter
            count={countChars(value)}
            max={maxLength}
            className="absolute right-3 bottom-1.5"
          />
        )}
      </div>
    </Field>
  );
};

export default TextArea;
