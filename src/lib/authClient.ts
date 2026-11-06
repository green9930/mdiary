import { createAuthClient } from "better-auth/react";

// 화면에서 로그인·로그아웃·세션 조회에 쓴다. 주소는 지금 열린 사이트를 따른다
export const authClient = createAuthClient();
