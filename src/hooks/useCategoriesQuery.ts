import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import {
  type CategoriesQuery,
  convertCategorySlug,
  resolveCategoriesQuery,
} from "@/lib/categoriesUtils";
import { categoriesPath } from "@/lib/navigation";
import { URL_PARAMS } from "@/shared/sharedConstants";
import type { CategoryType, ListSortType, Period } from "@/types/expenseTypes";

/**
 * 카테고리별 화면의 기간·카테고리·정렬을 URL 쿼리로 다룬다 (화면 명세 SC-04, 공통 규약 상태를 URL에 둔다).
 * 바꿀 때는 기록을 쌓지 않는다(replace). 잘못된 쿼리는 기본값으로 그리고 주소도 바꾼다
 */
export const useCategoriesQuery = (thisMonth: string) => {
  const router = useRouter();
  const params = useSearchParams();
  const raw = {
    from: params.get(URL_PARAMS.from),
    to: params.get(URL_PARAMS.to),
    category: params.get(URL_PARAMS.category),
    sort: params.get(URL_PARAMS.sort),
  };
  const query = resolveCategoriesQuery(raw, thisMonth);
  // 열린 상세 시트는 조건을 바꿔도 남긴다
  const expense = params.get(URL_PARAMS.expense);
  const path = categoriesPath(query, expense);
  const hasQuery = Object.values(raw).some((value) => value !== null);
  const needsReplace =
    hasQuery &&
    (raw.from !== query.from ||
      raw.to !== query.to ||
      raw.category !==
        (query.category && convertCategorySlug(query.category)) ||
      raw.sort !== query.sort);

  useEffect(() => {
    if (needsReplace) router.replace(path, { scroll: false });
  }, [needsReplace, router, path]);

  const go = (next: Partial<CategoriesQuery>) => {
    router.replace(categoriesPath({ ...query, ...next }, expense), {
      scroll: false,
    });
  };

  return {
    query,
    /** 기간을 바꾼다. 카테고리·정렬은 유지한다 */
    setPeriod: (period: Period) => go(period),
    /** 카테고리 필터. null = 전체 */
    setCategory: (category: CategoryType | null) => go({ category }),
    setSort: (sort: ListSortType) => go({ sort }),
  };
};
