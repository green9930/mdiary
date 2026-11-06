import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";

import { TEST_USER } from "@/server/tests/testUserConstants";

// 테스트 로그인(P3): POST /api/auth/test-login → 테스트 사용자로 세션을 만든다.
// auth.ts가 E2E_TEST_LOGIN=1이고 운영이 아닐 때만 붙이므로, 운영에는 경로가 없다.
export const testLogin = () =>
  ({
    id: "test-login",
    endpoints: {
      testLogin: createAuthEndpoint(
        "/test-login",
        { method: "POST" },
        async (ctx) => {
          const adapter = ctx.context.internalAdapter;
          const found = await adapter.findUserByEmail(TEST_USER.email);
          const user =
            found?.user ??
            (await adapter.createUser(
              {
                id: TEST_USER.id,
                name: TEST_USER.name,
                email: TEST_USER.email,
                emailVerified: true,
              },
              { method: "test-login" },
            ));
          const session = await adapter.createSession(user.id);
          await setSessionCookie(ctx, { session, user });
          return ctx.json({ email: user.email });
        },
      ),
    },
  }) satisfies BetterAuthPlugin;
