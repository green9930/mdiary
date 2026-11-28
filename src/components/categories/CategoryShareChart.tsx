import CategoryIcon from "@/components/category/CategoryIcon";
import { CATEGORY_BAR_CLASSES } from "@/components/category/categoryIconConstants";
import { formatAmount } from "@/lib/amount";
import { convertCategoryLabel, convertShare } from "@/lib/categoriesUtils";
import { cn } from "@/lib/cn";
import { ARIA_LABELS } from "@/shared/sharedConstants";
import type { CategoryStats, CategoryType } from "@/types/expenseTypes";

interface CategoryShareChartProps {
  /** 지출이 있는 카테고리만, 금액 내림차순 (서버 순서 그대로 그린다) */
  stats: CategoryStats;
  /** 필터로 고른 카테고리. null = 전체 */
  selected: CategoryType | null;
  /** 줄을 누르면 그 카테고리, 선택된 줄을 다시 누르면 null(전체) */
  onSelect: (category: CategoryType | null) => void;
}

// 비중 가로 막대 그래프 (화면 명세 SC-04, 와이어프레임 ③④, 토큰 5-4).
// 한 줄: 아이콘·이름 · 막대(폭 = 비중, 최소 2px) · 비율 · 금액. 필터가 있으면 그 줄만 강조, 나머지는 흐리게
const CategoryShareChart = ({
  stats,
  selected,
  onSelect,
}: CategoryShareChartProps) => {
  return (
    <ul
      aria-label={ARIA_LABELS.categoryShare}
      // 줄마다 열 폭을 같이 써서 막대 시작·끝을 맞춘다 (아이콘 · 이름 · 막대 · 비율 · 금액)
      className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto]"
    >
      {stats.categories.map(({ category, total }) => {
        const share = convertShare(total, stats.total);
        const isSelected = category === selected;
        return (
          <li key={category} className="col-span-full grid grid-cols-subgrid">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : category)}
              className={cn(
                "col-span-full grid h-12 grid-cols-subgrid items-center gap-x-2 text-left active:bg-surface",
                selected !== null && !isSelected && "opacity-35",
              )}
            >
              <CategoryIcon category={category} />
              <span className="text-body text-text01">
                {convertCategoryLabel(category)}
              </span>
              <span
                aria-hidden
                className="h-2 overflow-hidden rounded-full bg-surface"
              >
                <span
                  data-testid="share-bar"
                  className={`block h-full min-w-0.5 rounded-full ${CATEGORY_BAR_CLASSES[category]}`}
                  style={{ width: `${share.percent}%` }}
                />
              </span>
              <span className="text-right font-num text-caption text-text02 tabular-nums">
                {share.text}
              </span>
              <span className="text-right font-num text-num-md text-text01 tabular-nums">
                {formatAmount(total)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default CategoryShareChart;
