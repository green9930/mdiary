import { CATEGORY_ICONS } from "@/components/category/categoryIconConstants";
import type { CategoryType } from "@/types/expenseTypes";

interface CategoryIconProps {
  category: CategoryType;
}

// 카테고리 아이콘 자리 (토큰 5-4): 지름 36 원, 카테고리 색 15% 면, 아이콘 24는 카테고리 색
const CategoryIcon = ({ category }: CategoryIconProps) => {
  const { Icon, colorClass } = CATEGORY_ICONS[category];

  return (
    <span
      aria-hidden
      className={`grid size-9 shrink-0 place-items-center rounded-full ${colorClass}`}
    >
      <Icon className="size-6" />
    </span>
  );
};

export default CategoryIcon;
