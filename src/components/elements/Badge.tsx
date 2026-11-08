import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

// 배지 (토큰 5-4): 정기 · 할부 n/m
interface BadgeProps {
  children: ReactNode;
  className?: string;
}

const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm bg-tint px-1.5 py-px text-micro whitespace-nowrap text-on-tint",
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
