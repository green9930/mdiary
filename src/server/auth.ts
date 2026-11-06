import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { prisma } from "@/server/db";
import {
  SESSION_EXPIRES_IN,
  SESSION_UPDATE_AGE,
} from "@/server/sessionConstants";
import { testLogin } from "@/server/tests/testLogin";

const enableTestLogin =
  env.E2E_TEST_LOGIN === "1" && env.NODE_ENV !== "production";

// BETTER_AUTH_SECRET·BETTER_AUTH_URL은 Better Auth가 환경 변수에서 직접 읽는다
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  session: { expiresIn: SESSION_EXPIRES_IN, updateAge: SESSION_UPDATE_AGE },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // nextCookies는 서버 액션에서 쿠키를 쓰게 해 주며, 목록의 마지막에 둔다
  plugins: [...(enableTestLogin ? [testLogin()] : []), nextCookies()],
});
