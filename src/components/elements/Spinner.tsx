import { cn } from "@/lib/cn";

// 스피너 (토큰 5-6): 지름 18, 선 2, 색은 놓인 자리의 글자색
interface SpinnerProps {
  label?: string;
  className?: string;
}

const Spinner = ({ label, className }: SpinnerProps) => {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-block size-4.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  );
};

export default Spinner;
