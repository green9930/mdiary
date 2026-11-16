/** 검증 실패 응답 (데이터 아키텍처 8-3). fields는 필드별 실패 코드 */
export const validationFailed = (fields: Record<string, string>): Response =>
  Response.json({ code: "VALIDATION", fields }, { status: 400 });

/**
 * Route Handler를 감싼다. 처리하지 못한 오류(DB 연결 실패 등)는 서버 로그에 남기고
 * 500 `{ code: "INTERNAL" }`로 답한다 (데이터 아키텍처 8-3)
 */
export const withApiErrors =
  <TArgs extends unknown[]>(handler: (...args: TArgs) => Promise<Response>) =>
  async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[api] 처리하지 못한 오류", error);
      return Response.json({ code: "INTERNAL" }, { status: 500 });
    }
  };
