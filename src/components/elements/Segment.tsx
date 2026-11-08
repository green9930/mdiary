import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  "aria-label": string;
  disabled?: boolean;
  className?: string;
}

// 세그먼트 2단·3단 (와이어프레임 CG ④, 토큰 5-3): 항상 하나가 선택돼 있다
const Segment = <T extends string>({
  options,
  value,
  onValueChange,
  disabled = false,
  className,
  ...props
}: SegmentProps<T>) => {
  return (
    <div
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={cn(
        "flex h-10 overflow-hidden rounded-md border border-line-strong",
        disabled && "bg-surface",
        className,
      )}
      {...props}
    >
      {options.map((option) => {
        const selected = option.value === value;
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
            className={cn(
              "flex-1 text-body not-first:border-l not-first:border-line-strong",
              disabled
                ? cn("text-on-disabled", selected && "bg-line-strong")
                : selected
                  ? "bg-primary font-bold text-on-primary"
                  : "text-text-sub",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default Segment;
