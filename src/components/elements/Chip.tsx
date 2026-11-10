import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  selected: boolean;
  onClick?: () => void;
}

// 필터 칩 (토큰 5-3): 높이 32, 누르는 영역은 44
const Chip = ({ children, selected, onClick }: ChipProps) => {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`touch-44 h-8 shrink-0 rounded-full border px-3 text-body whitespace-nowrap ${
        selected
          ? "border-primary bg-primary font-bold text-on-primary"
          : "border-line-strong text-text01"
      }`}
    >
      {children}
    </button>
  );
};

export default Chip;
