import type { ReactNode } from "react";

import CheckboxBlankIcon from "@/assets/icon_checkbox_blank.svg";
import CheckboxFilledIcon from "@/assets/icon_checkbox_filled.svg";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}

// 체크박스 (와이어프레임 CG ④, 토큰 5-3): 라벨을 눌러도 반응한다
const Checkbox = ({
  checked,
  onCheckedChange,
  disabled = false,
  children,
}: CheckboxProps) => {
  const Icon = checked ? CheckboxFilledIcon : CheckboxBlankIcon;

  return (
    <label
      className={`flex min-h-11 items-center gap-2 text-body ${
        disabled
          ? "text-on-disabled hover:cursor-not-allowed"
          : "text-text01 hover:cursor-pointer"
      }`}
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
        className={`size-6 shrink-0 rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-accent ${
          disabled
            ? "text-on-disabled"
            : checked
              ? "text-primary"
              : "text-text02"
        }`}
      />
      {children}
    </label>
  );
};

export default Checkbox;
