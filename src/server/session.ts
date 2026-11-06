import { headers } from "next/headers";

import { auth } from "@/server/auth";

export type SessionUser = { id: string; email: string };

/** 지금 요청의 로그인 사용자. 없으면 null. */
export const getSessionUser = async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? { id: session.user.id, email: session.user.email } : null;
};

/** API에서 세션이 없을 때 돌려줄 응답 (데이터 아키텍처 8-3) */
export const unauthorized = (): Response => {
  return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
};
