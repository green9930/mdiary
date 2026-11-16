import { useId } from "react";

import CategoryIcon from "@/components/category/CategoryIcon";
import { fieldMessageId } from "@/components/elements/Field";
import { CATEGORY_LIST } from "@/shared/expenseConstants";
import { FIELD_LABELS } from "@/shared/sharedConstants";
import type { CategoryType } from "@/types/expenseTypes";

interface CategoryGridProps {
  /** 첫 칸의 id. 오류 칸으로 포커스를 옮길 때 쓴다 */
  id: string;
  value: CategoryType | null;
  onChange: (category: CategoryType) => void;
  error?: string;
}

// 카테고리 격자 (화면 명세 SC-06, 토큰 5-3): 4열(4·4·2, 마지막 줄 왼쪽 정렬), 하나만 고른다.
// 고른 칸을 다시 눌러도 풀리지 않는다. 선택 테두리 2px는 안쪽 outline으로 그려 크기가 변하지 않게 한다
const CategoryGrid = ({ id, value, onChange, error }: CategoryGridProps) => {
  const labelId = useId();

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="text-body text-text01">
        {FIELD_LABELS.category}
      </p>
      <div className="flex flex-col gap-1">
        <div
          role="group"
          aria-labelledby={labelId}
          aria-describedby={error ? fieldMessageId(id) : undefined}
          className="grid grid-cols-4 gap-2"
        >
          {CATEGORY_LIST.map((category, index) => {
            const selected = category.value === value;
            return (
              <button
                key={category.value}
                id={index === 0 ? id : undefined}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(category.value)}
                className={`flex h-18 flex-col items-center justify-center gap-1 rounded-md border text-caption ${
                  selected
                    ? "border-accent bg-tint font-bold text-on-tint outline-2 -outline-offset-2 outline-accent"
                    : "border-line text-text02 active:bg-surface"
                }`}
              >
                <CategoryIcon category={category.value} />
                {category.label}
              </button>
            );
          })}
        </div>
        {error && (
          <p id={fieldMessageId(id)} className="text-caption text-danger-text">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryGrid;
