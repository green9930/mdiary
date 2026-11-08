import { cn } from "@/lib/cn";

// 글자 수 카운터 n/25 (CG ③, 토큰 5-2): 한도에 닿으면 강조
interface CharCounterProps {
  count: number;
  max: number;
  className?: string;
}

const CharCounter = ({ count, max, className }: CharCounterProps) => {
  const shown = Math.min(count, max);
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0 font-num text-caption tabular-nums",
        shown >= max ? "text-text-sub" : "text-text-weak",
        className,
      )}
    >
      {shown}/{max}
    </span>
  );
};

export default CharCounter;
