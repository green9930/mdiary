/** API 오류 응답 (데이터 아키텍처 8-3). code는 본문의 `code`, 본문이 JSON이 아니면 null */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null) {
    super(`API ${status}${code ? ` ${code}` : ""}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** 세션 없음·만료 (401) */
export const isUnauthorized = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 401;

/** 없는 기록 (404, 다른 기기에서 이미 삭제) */
export const isNotFound = (error: unknown): boolean =>
  error instanceof ApiError && error.status === 404;

const readCode = async (response: Response): Promise<string | null> => {
  try {
    const body: unknown = await response.json();
    return typeof body === "object" &&
      body !== null &&
      "code" in body &&
      typeof body.code === "string"
      ? body.code
      : null;
  } catch {
    return null;
  }
};

/**
 * 브라우저 → 서버 요청의 공통 처리. 성공하면 JSON 본문을, 실패하면 ApiError를 던진다.
 * 네트워크 오류는 fetch의 오류를 그대로 던진다. 401은 QueryClient가 받아 로그인으로 보낸다
 */
export const apiFetch = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok)
    throw new ApiError(response.status, await readCode(response));
  return (await response.json()) as T;
};
