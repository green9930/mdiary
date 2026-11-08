import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import CheckboxBlankIcon from "@/assets/icon_checkbox_blank.svg";
import CheckboxFilledIcon from "@/assets/icon_checkbox_filled.svg";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

// 체크박스 (와이어프레임 CG ④, 토큰 5-3): 라벨을 눌러도 반응한다
const Checkbox = ({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  children,
}: CheckboxProps) => {
  const Icon = checked ? CheckboxFilledIcon : CheckboxBlankIcon;

  return (
    <label
      className={cn(
        "flex min-h-11 items-center gap-2.5 text-body",
        disabled ? "text-on-disabled" : "text-text",
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <Icon
        aria-hidden
        className={cn(
          "size-6 shrink-0 rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-accent",
          disabled
            ? "text-on-disabled"
            : checked
              ? "text-primary"
              : "text-text-sub",
        )}
      />
      {children}
    </label>
  );
};

export default Checkbox;
