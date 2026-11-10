import type { QueryObserverResult } from "@tanstack/react-query";

/** 영역에 그릴 것: 스켈레톤(CM ①), 조회 실패(②), 데이터 */
export type QueryViewType = "skeleton" | "loadError" | "data";

// 조회 결과로 영역에 무엇을 그릴지 정한다 (와이어프레임 CM ①~③).
// 조건을 바꿔 실패하면 새 조건의 데이터가 없으므로 ②, 같은 조건으로 다시 불러오다 실패하면 데이터를 두고 띠(③).
// 무한 스크롤 다음 장 실패(④)는 isRefetchError에 들지 않는다
export const getQueryView = (
  query: Pick<QueryObserverResult, "data" | "isError" | "isRefetchError">,
): { view: QueryViewType; refreshFailed: boolean } => {
  if (query.data !== undefined) {
    return { view: "data", refreshFailed: query.isRefetchError };
  }
  return {
    view: query.isError ? "loadError" : "skeleton",
    refreshFailed: false,
  };
};
