import { keepPreviousData, QueryClient } from "@tanstack/react-query";

// 조건을 바꿔 다시 불러올 때(월 이동, 기간·필터 변경) 이전 데이터를 보여준 채 갱신한다 (화면 명세 공통 규약 · 로딩)
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { placeholderData: keepPreviousData },
    },
  });
