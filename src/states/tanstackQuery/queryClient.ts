import {
  keepPreviousData,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import { isUnauthorized } from "@/api/apiClient";
import { hardNavigate } from "@/lib/navigation";
import { loginPath } from "@/shared/nextPath";

const MAX_RETRIES = 3;

interface QueryClientOptions {
  /** 요청이 401일 때. 기본은 지금 경로를 담아 로그인 화면으로 보낸다 */
  onUnauthorized?: () => void;
}

// 세션 만료(401)는 어느 화면에서든 같은 처리다 (화면 명세 RT).
// 페이지를 새로 불러와 화면에 남은 데이터를 버린다
const redirectToLogin = () => {
  const { pathname, search } = window.location;
  hardNavigate(loginPath(pathname + search, "expired"));
};

export const createQueryClient = ({
  onUnauthorized = redirectToLogin,
}: QueryClientOptions = {}) => {
  // 여러 요청이 한꺼번에 401이어도 한 번만 보낸다
  let redirected = false;
  const handleError = (error: unknown) => {
    if (!isUnauthorized(error) || redirected) return;
    redirected = true;
    onUnauthorized();
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        // 조건을 바꿔 다시 불러올 때(월 이동, 기간·필터 변경) 이전 데이터를 보여준 채 갱신한다 (화면 명세 공통 규약 · 로딩)
        placeholderData: keepPreviousData,
        // 401은 다시 시도해도 같으므로 바로 로그인으로 보낸다
        retry: (failureCount, error) =>
          !isUnauthorized(error) && failureCount < MAX_RETRIES,
      },
    },
  });
};
