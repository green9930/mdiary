import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

import { env } from "@/env";
import { prisma } from "@/server/db";

// 로그인 경로·세션 확인은 3-4에서 붙인다. BETTER_AUTH_SECRET·URL은 환경 변수에서 읽힌다
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
