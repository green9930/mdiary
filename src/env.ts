import { z } from "zod";

const postgresUrl = z
  .string()
  .regex(/^postgres(ql)?:\/\//, "postgres:// 주소가 아닙니다");

const secret = z.string().min(32, "32자 이상이어야 합니다");

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: postgresUrl,
    DIRECT_URL: postgresUrl,
    BETTER_AUTH_SECRET: secret,
    BETTER_AUTH_URL: z.url("URL 형식이 아닙니다"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    CRON_SECRET: secret,
    E2E_TEST_LOGIN: z.enum(["", "1"], "비어 있거나 1이어야 합니다").default(""),
  })
  .refine((env) => env.CRON_SECRET !== env.BETTER_AUTH_SECRET, {
    path: ["CRON_SECRET"],
    message: "BETTER_AUTH_SECRET과 달라야 합니다",
  })
  .refine(
    (env) => !(env.NODE_ENV === "production" && env.E2E_TEST_LOGIN === "1"),
    {
      path: ["E2E_TEST_LOGIN"],
      message: "운영에서는 켤 수 없습니다",
    },
  );

export type EnvType = z.infer<typeof envSchema>;

// 실패하면 변수 이름과 이유만 알린다. 값은 출력하지 않는다.
export const parseEnv = (
  source: Record<string, string | undefined>,
): EnvType => {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const lines = result.error.issues.map((issue) => {
    const name = issue.path.join(".");
    const reason =
      issue.code === "invalid_type" ? "값이 없습니다" : issue.message;
    return `- ${name}: ${reason}`;
  });
  throw new Error(`환경 변수가 올바르지 않습니다.\n${lines.join("\n")}`);
};

export const env = parseEnv(process.env);
