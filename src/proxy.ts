import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { loginPath, safeNextPath } from "@/shared/nextPath";

/**
 * 화면 경로의 로그인 확인 (화면 명세 RT). 세션 쿠키가 있는지만 본다.
 * 세션이 실제로 유효한지는 서버(getSessionUser)와 API(401)가 확인한다.
 * 보낼 곳이 없으면 null.
 */
export const redirectTarget = (
  url: URL,
  hasSession: boolean,
): string | null => {
  if (url.pathname === "/login") {
    // 만료·탈퇴로 온 경우는 쿠키가 남아 있어도 로그인 화면을 보여준다 (되돌려 보내면 무한 반복)
    if (!hasSession || url.searchParams.has("reason")) return null;
    return safeNextPath(url.searchParams.get("next"));
  }
  return hasSession ? null : loginPath(url.pathname + url.search);
};

export const proxy = (request: NextRequest) => {
  const target = redirectTarget(
    request.nextUrl,
    getSessionCookie(request) !== null,
  );
  return target
    ? NextResponse.redirect(new URL(target, request.url))
    : NextResponse.next();
};

export const config = {
  // API(401로 답한다)·Next 내부 파일·정적 파일은 제외한다
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
