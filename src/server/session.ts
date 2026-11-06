import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { loginPath } from "@/shared/nextPath";

export type SessionUser = { id: string; email: string };

/** 지금 요청의 로그인 사용자. 없으면 null. */
export const getSessionUser = async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? { id: session.user.id, email: session.user.email } : null;
};

/** 화면에서 로그인 사용자를 얻는다. 세션이 없으면 만료 안내와 함께 로그인으로 보낸다 (화면 명세 RT) */
export const requireSessionUser = async (
  path: string,
): Promise<SessionUser> => {
  const user = await getSessionUser();
  if (!user) redirect(loginPath(path, "expired"));
  return user;
};

/** API에서 세션이 없을 때 돌려줄 응답 (데이터 아키텍처 8-3) */
export const unauthorized = (): Response => {
  return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
};
