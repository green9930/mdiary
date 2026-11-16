import CategoryIcon from "@/components/category/CategoryIcon";
import type { TitleSuggestion } from "@/types/expenseTypes";

interface TitleSuggestionsProps {
  /** 목록의 id. 제목 입력칸이 aria-controls로 가리킨다 */
  id: string;
  suggestions: TitleSuggestion[];
  onSelect: (suggestion: TitleSuggestion) => void;
}

// 자주 쓴 제목 추천 목록 (와이어프레임 SC-06 ④): 제목 입력칸 바로 아래에 겹쳐 뜬다.
// 입력 중에는 제목 오류가 지워지므로 감싸는 상자(relative)의 아래 끝이 입력칸 아래 끝이다.
// 항목은 제목 + 마지막으로 쓴 카테고리 아이콘. 누를 때 입력칸의 포커스를 뺏지 않는다(벗어남으로 닫히지 않게)
const TitleSuggestions = ({
  id,
  suggestions,
  onSelect,
}: TitleSuggestionsProps) => {
  return (
    <ul
      id={id}
      role="listbox"
      className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md bg-surface py-1 shadow-1 dark:border dark:border-line"
    >
      {suggestions.map((suggestion) => (
        <li
          key={suggestion.title}
          role="option"
          aria-selected={false}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(suggestion)}
          className="flex h-11 cursor-pointer items-center gap-3 px-3.5 text-body-lg text-text01 active:bg-surface"
        >
          <span className="min-w-0 flex-1 truncate">{suggestion.title}</span>
          <CategoryIcon category={suggestion.lastCategory} />
        </li>
      ))}
    </ul>
  );
};

export default TitleSuggestions;
