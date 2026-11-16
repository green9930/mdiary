import { z } from "zod";

import { isValidDate } from "@/lib/date";
import { countChars, removeControlChars, toSingleLine } from "@/lib/text";
import { CATEGORY_LIST, EXPENSE_RULES } from "@/shared/expenseConstants";
import type { CategoryType } from "@/types/expenseTypes";

// 검증 실패 코드는 오류 응답의 fields 값으로 그대로 쓴다 (데이터 아키텍처 8-3)

const categoryValues = CATEGORY_LIST.map(({ value }) => value) as [
  CategoryType,
  ...CategoryType[],
];

// 제목: 한 줄로 바꾸고 제어문자·앞뒤 공백을 지운 뒤 1~25자
const titleSchema = z
  .string({ error: "REQUIRED" })
  .transform((value) => toSingleLine(removeControlChars(value)).trim())
  .pipe(
    z
      .string()
      .min(1, { error: "REQUIRED" })
      .refine((value) => countChars(value) <= EXPENSE_RULES.titleMax, {
        error: "TOO_LONG",
      }),
  );

// 내용: 제어문자·앞뒤 공백을 지운 뒤 0~200자, 비면 null
const contentSchema = z
  .string({ error: "INVALID" })
  .nullish()
  .transform((value) => removeControlChars(value ?? "").trim() || null)
  .pipe(
    z
      .string()
      .refine((value) => countChars(value) <= EXPENSE_RULES.contentMax, {
        error: "TOO_LONG",
      })
      .nullable(),
  );

const amountSchema = z
  .number({ error: "OUT_OF_RANGE" })
  .int({ error: "OUT_OF_RANGE" })
  .min(EXPENSE_RULES.amountMin, { error: "OUT_OF_RANGE" })
  .max(EXPENSE_RULES.amountMax, { error: "OUT_OF_RANGE" });

/** 등록 요청 (데이터 아키텍처 8-2). 반복은 F6 전까지 없음만 받는다 */
export const createExpenseSchema = z.object({
  date: z
    .string({ error: "INVALID" })
    .refine(isValidDate, { error: "INVALID" }),
  title: titleSchema,
  category: z.enum(categoryValues, { error: "REQUIRED" }),
  amount: amountSchema,
  content: contentSchema,
  repeat: z.object(
    { type: z.literal("none", { error: "INVALID" }) },
    { error: "INVALID" },
  ),
});

/** 검증 실패를 필드별 코드로 모은다 (`{ title: "REQUIRED" }`). 필드마다 첫 오류만 쓴다 */
export const fieldErrorCodes = (error: z.ZodError) => {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    fields[field] ??= issue.message;
  }
  return fields;
};
