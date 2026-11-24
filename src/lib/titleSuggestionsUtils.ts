import { matchesTitle } from "@/lib/hangul";
import { EXPENSE_RULES } from "@/shared/expenseConstants";
import type { TitleSuggestion } from "@/types/expenseTypes";

/**
 * 입력에 맞는 자주 쓴 제목 (화면 명세 SC-06). 받은 순서(사용 횟수 → 최근 사용)를 그대로 쓴다.
 * 입력이 비었거나, 입력과 완전히 같은 제목 하나만 남으면 빈 목록이다
 */
export const filterTitleSuggestions = (
  suggestions: TitleSuggestion[],
  input: string,
): TitleSuggestion[] => {
  const query = input.trim();
  if (!query) return [];
  const matched = suggestions
    .filter(({ title }) => matchesTitle(title, query))
    .slice(0, EXPENSE_RULES.titleSuggestionMax);
  return matched.length === 1 && matched[0]?.title === query ? [] : matched;
};
