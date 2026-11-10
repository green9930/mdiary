import type { ReactNode } from "react";

// 배지 (토큰 5-4): 정기 · 할부 n/m
interface BadgeProps {
  children: ReactNode;
}

const Badge = ({ children }: BadgeProps) => {
  return (
    <span className="inline-flex shrink-0 items-center rounded-sm bg-tint px-1.5 py-px text-micro whitespace-nowrap text-on-tint">
      {children}
    </span>
  );
};

export default Badge;
