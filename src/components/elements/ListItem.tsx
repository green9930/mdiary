import type { ReactNode } from "react";

import CategoryIcon from "@/components/category/CategoryIcon";
import type { CategoryType } from "@/types/expenseTypes";

interface ListItemProps {
  category: CategoryType;
  title: ReactNode;
  badge?: ReactNode; // 제목 옆 배지 (정기·할부). 말줄임 대상이 아니다
  subtitle?: ReactNode;
  amount: string; // 형식을 맞춘 금액 (예: "12,300원") 줄이지 않는다
  onClick?: () => void;
}

// 목록 항목 (와이어프레임 CG ⑨, 토큰 5-4): 높이 56, 항목 전체가 누르는 영역
const ListItem = ({
  category,
  title,
  badge,
  subtitle,
  amount,
  onClick,
}: ListItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center gap-3 border-b border-line text-left active:bg-surface"
    >
      <CategoryIcon category={category} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5 text-body text-text01">
          <span className="truncate">{title}</span>
          {badge}
        </span>
        {subtitle && (
          <span className="truncate font-num text-caption text-text02">
            {subtitle}
          </span>
        )}
      </span>
      <span className="shrink-0 font-num text-num-md text-text01 tabular-nums">
        {amount}
      </span>
    </button>
  );
};

export default ListItem;
