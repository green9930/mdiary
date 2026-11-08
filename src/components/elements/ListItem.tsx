import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ListItemProps {
  /** 카테고리 아이콘 (24) */
  icon: ReactNode;
  /** 아이콘 자리 색. 카테고리 색이면 그 색 15% 면 + 아이콘 색 (예: "bg-cat-food/15 text-cat-food") */
  iconClassName?: string;
  title: ReactNode;
  /** 제목 옆 배지 (정기·할부). 말줄임 대상이 아니다 */
  badge?: ReactNode;
  /** 보조 줄 (날짜, 내용 일치 줄) */
  subtitle?: ReactNode;
  /** 형식을 맞춘 금액 (예: "12,300원"). 줄이지 않는다 */
  amount: string;
  onClick?: () => void;
  className?: string;
}

// 목록 항목 (와이어프레임 CG ⑨, 토큰 5-4): 높이 56, 항목 전체가 누르는 영역
const ListItem = ({
  icon,
  iconClassName,
  title,
  badge,
  subtitle,
  amount,
  onClick,
  className,
}: ListItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 w-full items-center gap-3 border-b border-line text-left active:bg-surface",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full bg-surface text-text-sub [&>svg]:size-6",
          iconClassName,
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5 text-body text-text">
          <span className="truncate">{title}</span>
          {badge}
        </span>
        {subtitle && (
          <span className="truncate font-num text-caption text-text-sub">
            {subtitle}
          </span>
        )}
      </span>
      <span className="shrink-0 font-num text-num-m text-text tabular-nums">
        {amount}
      </span>
    </button>
  );
};

export default ListItem;
