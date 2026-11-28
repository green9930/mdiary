import { isValidMonth } from "@/lib/date";
import { isPeriodWithinMax } from "@/lib/periodUtils";
import { CATEGORY_LIST } from "@/shared/expenseConstants";
import { STATS_TEXTS } from "@/shared/sharedConstants";
import type { CategoryType, ListSortType, Period } from "@/types/expenseTypes";

// 카테고리별 화면의 쿼리·비중 (화면 명세 SC-04)

interface CategoriesQueryInput {
  from: string | null;
  to: string | null;
  category: string | null;
  sort: string | null;
}

export interface CategoriesQuery extends Period {
  /** null = 전체 */
  category: CategoryType | null;
  sort: ListSortType;
}

const SORTS: readonly ListSortType[] = ["latest", "amount"];

/** 카테고리 이름 (`FOOD` → `식비`) */
export const convertCategoryLabel = (category: CategoryType) =>
  CATEGORY_LIST.find(({ value }) => value === category)?.label ?? category;

/** URL 쿼리의 카테고리 값: 카테고리 값의 소문자 (`food`) */
export const convertCategorySlug = (category: CategoryType) =>
  category.toLowerCase();

const categoryOfSlug = (slug: string) =>
  CATEGORY_LIST.find((item) => convertCategorySlug(item.value) === slug)
    ?.value ?? null;

/**
 * 카테고리별 쿼리를 정한다. 잘못된 값은 오류 없이 기본값(이번 달 · 전체 · 최신순)으로 바꾼다.
 * 필드마다 따로 고치되, 시작·끝 달은 한 쌍으로 본다
 */
export const resolveCategoriesQuery = (
  input: CategoriesQueryInput,
  thisMonth: string,
): CategoriesQuery => {
  const { from, to } = input;
  const period =
    from !== null &&
    to !== null &&
    isValidMonth(from) &&
    isValidMonth(to) &&
    isPeriodWithinMax({ from, to })
      ? { from, to }
      : { from: thisMonth, to: thisMonth };
  return {
    ...period,
    category: input.category === null ? null : categoryOfSlug(input.category),
    sort: SORTS.find((sort) => sort === input.sort) ?? "latest",
  };
};

/**
 * 카테고리 비중: 기간 총지출 안의 비율. 소수 첫째 자리, 0.1% 미만은 `<0.1%`.
 * percent는 막대 폭(%)이다. 합을 100.0%로 맞추지 않는다
 */
export const convertShare = (amount: number, total: number) => {
  const percent = (amount / total) * 100;
  return {
    text:
      amount * 1000 < total
        ? STATS_TEXTS.belowTenth
        : `${(Math.round(percent * 10) / 10).toFixed(1)}%`,
    percent,
  };
};
