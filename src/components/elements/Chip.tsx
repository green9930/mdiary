import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface ChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-pressed"
> {
  selected: boolean;
}

// 필터 칩 (토큰 5-3): 높이 32, 누르는 영역은 44
const Chip = ({
  selected,
  type = "button",
  className,
  ...props
}: ChipProps) => {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "touch-44 h-8 shrink-0 rounded-full border px-3.5 text-body whitespace-nowrap",
        selected
          ? "border-primary bg-primary font-bold text-on-primary"
          : "border-line-strong text-text",
        className,
      )}
      {...props}
    />
  );
};

export default Chip;
