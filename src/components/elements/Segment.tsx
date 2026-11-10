import { cn } from "@/lib/cn";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-label": string;
  disabled?: boolean;
}

// 칸의 상태별 면·글자 (토큰 5-3)
const OPTION_CLASSES = {
  default: "text-text02",
  selected: "bg-primary font-bold text-on-primary",
  disabled: "text-on-disabled",
  disabledSelected: "bg-line-strong text-on-disabled",
};

// 세그먼트 2단·3단 (와이어프레임 CG ④, 토큰 5-3): 항상 하나가 선택돼 있다
const Segment = <T extends string>({
  options,
  value,
  onValueChange,
  disabled = false,
  "aria-label": ariaLabel,
}: SegmentProps<T>) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex h-10 overflow-hidden rounded-md border border-line-strong",
        disabled && "bg-surface",
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const state = disabled
          ? selected
            ? "disabledSelected"
            : "disabled"
          : selected
            ? "selected"
            : "default";
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => {
              if (!selected) onValueChange(option.value);
            }}
            className={`flex-1 text-body not-first:border-l not-first:border-line-strong ${OPTION_CLASSES[state]}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default Segment;
