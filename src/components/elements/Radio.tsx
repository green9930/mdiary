import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
  /** 라벨 아래 안내 문구 (비활성 이유 등) */
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

// 라디오 (와이어프레임 CG ④, 토큰 5-3): 라벨을 눌러도 반응한다.
// 비활성은 원 테두리·라벨 on-disabled, 안내 문구는 라벨 아래 caption text-sub
const Radio = ({
  name,
  value,
  checked,
  onSelect,
  disabled = false,
  hint,
  className,
  children,
}: RadioProps) => {
  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-2.5 text-body",
        disabled ? "text-on-disabled" : "text-text",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          disabled
            ? "border-on-disabled"
            : checked
              ? "border-primary"
              : "border-line-strong",
        )}
      >
        {checked && !disabled && (
          <span className="size-2.5 rounded-full bg-primary" />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span>{children}</span>
        {hint && <span className="text-caption text-text-sub">{hint}</span>}
      </span>
    </label>
  );
};

export default Radio;
