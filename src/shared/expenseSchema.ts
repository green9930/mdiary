import { z } from "zod";

import { addMonths, isValidDate, isValidMonth, monthOf } from "@/lib/date";
import { isPeriodWithinMax } from "@/lib/periodUtils";
import { countChars, removeControlChars, toSingleLine } from "@/lib/text";
import {
  CATEGORY_LIST,
  EXPENSE_RULES,
  SERIES_RULES,
} from "@/shared/expenseConstants";
import { DATE_RULES } from "@/shared/sharedConstants";
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

// 정기지출 개월 수·할부 회차: 2~99
const repeatCountSchema = z
  .number({ error: "OUT_OF_RANGE" })
  .int({ error: "OUT_OF_RANGE" })
  .min(SERIES_RULES.repeatMin, { error: "OUT_OF_RANGE" })
  .max(SERIES_RULES.repeatMax, { error: "OUT_OF_RANGE" });

const recurringType = z.literal("recurring", { error: "INVALID" });

// 반복 (데이터 아키텍처 8-2): 없음 · 정기 N개월 · 정기 계속 · 할부
const repeatSchema = z.union(
  [
    z.strictObject({ type: z.literal("none", { error: "INVALID" }) }),
    z.strictObject({ type: recurringType, months: repeatCountSchema }),
    z.strictObject({ type: recurringType, continuous: z.literal(true) }),
    z.strictObject({
      type: z.literal("installment", { error: "INVALID" }),
      count: repeatCountSchema,
      basis: z.enum(["perCount", "total"], { error: "INVALID" }),
    }),
  ],
  { error: "INVALID" },
);

/** 반복이 만드는 건수. 없음은 1, 계속은 null (끝이 없다) */
export const convertRepeatCount = (repeat: z.output<typeof repeatSchema>) => {
  if (repeat.type === "none") return 1;
  if (repeat.type === "installment") return repeat.count;
  return "months" in repeat ? repeat.months : null;
};

/** 날짜의 달부터 count개 달을 만들 때 마지막 달이 선택 가능 연도(2099년 12월) 안인지 */
export const isRepeatWithinMax = (date: string, count: number) =>
  addMonths(monthOf(date), count - 1) <= monthOf(DATE_RULES.maxDate);

/** 등록 요청 (데이터 아키텍처 8-2) */
export const createExpenseSchema = z
  .object({
    date: z
      .string({ error: "INVALID" })
      .refine(isValidDate, { error: "INVALID" }),
    title: titleSchema,
    category: z.enum(categoryValues, { error: "REQUIRED" }),
    amount: amountSchema,
    content: contentSchema,
    repeat: repeatSchema,
  })
  .superRefine(({ date, amount, repeat }, context) => {
    const count = convertRepeatCount(repeat);
    // 기간이 2099년 12월을 넘으면 만들지 않는다. 날짜가 틀렸으면 날짜 오류만 낸다
    if (count !== null && isValidDate(date) && !isRepeatWithinMax(date, count))
      context.addIssue({
        code: "custom",
        path: ["repeat"],
        message: "OUT_OF_RANGE",
      });
    // 할부 총액은 회차 수 이상 (회차당 1원 이상)
    if (
      repeat.type === "installment" &&
      repeat.basis === "total" &&
      amount < repeat.count
    )
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "BELOW_COUNT",
      });
  });

/** 수정·삭제 범위 (데이터 아키텍처 8-1 `scope`): 이번 건만 · 이후 전체 · 이 건부터 N개월 */
const scopeSchema = z.union(
  [
    z.strictObject({ type: z.literal("one") }),
    z.strictObject({ type: z.literal("after") }),
    z.strictObject({
      type: z.literal("count"),
      // 남은 건수 이하인지는 서버가 DB를 보고 다시 확인한다 (계속 반복은 99까지)
      n: z.number().int().min(1).max(SERIES_RULES.repeatMax),
    }),
  ],
  { error: "INVALID" },
);

/** 수정 요청 (데이터 아키텍처 8-1 `PATCH /api/expenses/:id`): 바꾼 필드 + scope. 바꾼 필드가 하나는 있어야 한다 */
export const updateExpenseSchema = z
  .object({
    date: createExpenseSchema.shape.date.optional(),
    title: titleSchema.optional(),
    category: createExpenseSchema.shape.category.optional(),
    amount: amountSchema.optional(),
    // null은 내용 지우기, 빠지면 그대로
    content: contentSchema.optional(),
    scope: scopeSchema,
  })
  .refine(
    ({ date, title, category, amount, content }) =>
      [date, title, category, amount, content].some(
        (value) => value !== undefined,
      ),
    { error: "NO_CHANGES", path: ["fields"] },
  );

/** 삭제 요청 (데이터 아키텍처 8-1 `DELETE /api/expenses/:id`) */
export const deleteExpenseSchema = z.object({ scope: scopeSchema });

/** 검증 실패를 필드별 코드로 모은다 (`{ title: "REQUIRED" }`). 필드마다 첫 오류만 쓴다 */
export const fieldErrorCodes = (error: z.ZodError) => {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    fields[field] ??= issue.message;
  }
  return fields;
};

/** 범위 미리보기 쿼리 (`GET /api/expenses/:id/scope?scope=&n=&date=`). date는 수정에서 바꾼 날짜 */
export const scopePreviewQuerySchema = z
  .object({
    scope: z.enum(["one", "after", "count"]),
    n: z.string().regex(/^\d+$/).optional(),
    date: z.string().refine(isValidDate).optional(),
  })
  .transform(({ scope, n, date }, context) => {
    const parsed = scopeSchema.safeParse(
      scope === "count" ? { type: scope, n: Number(n) } : { type: scope },
    );
    if (!parsed.success) {
      context.addIssue({ code: "custom", path: ["scope"], message: "INVALID" });
      return z.NEVER;
    }
    return date === undefined
      ? { scope: parsed.data }
      : { scope: parsed.data, date };
  });

// 조회 기간의 달: 실제 있는 달이고 선택 가능 연도 안
const monthSchema = z
  .string({ error: "REQUIRED" })
  .refine(isValidMonth, { error: "INVALID" });

/** 조회 기간 쿼리 (`from`·`to` YYYY-MM). 시작 ≤ 끝, 최대 60개월 (화면 명세 공통 정책값) */
export const periodQuerySchema = z
  .object({ from: monthSchema, to: monthSchema })
  .refine(isPeriodWithinMax, { path: ["to"], error: "OUT_OF_RANGE" });
