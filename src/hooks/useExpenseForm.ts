import { useState } from "react";

import { toDigits } from "@/lib/text";
import { EXPENSE_RULES } from "@/shared/expenseConstants";
import { FIELD_ERRORS } from "@/shared/sharedConstants";
import type {
  CategoryType,
  CreateExpenseRequestType,
} from "@/types/expenseTypes";

interface ExpenseFormValues {
  date: string;
  title: string;
  category: CategoryType | null;
  /** 숫자만 담은 문자열. 비어 있을 수 있다 */
  amount: string;
  content: string;
}

// 오류를 띄우는 칸. 화면 위에서 아래 순서 (첫 오류 칸으로 포커스할 때 쓴다)
const ERROR_FIELDS = ["title", "category", "amount"] as const;

type ExpenseErrorFieldType = (typeof ERROR_FIELDS)[number];

/** [저장]을 눌렀을 때: 첫 오류 칸, 또는 검증을 통과한 등록 요청 */
type SubmitResultType =
  { error: ExpenseErrorFieldType } | { request: CreateExpenseRequestType };

const validate = (
  field: ExpenseErrorFieldType,
  values: ExpenseFormValues,
): string | undefined => {
  switch (field) {
    case "title":
      return values.title.trim() ? undefined : FIELD_ERRORS.titleRequired;
    case "category":
      return values.category ? undefined : FIELD_ERRORS.categoryRequired;
    case "amount":
      return values.amount ? undefined : FIELD_ERRORS.amountRequired;
  }
};

/**
 * 지출 등록 폼의 값과 오류 (화면 명세 공통 규약 · 폼 검증).
 * 입력 중에는 그 칸의 오류를 지우기만 하고, 칸을 벗어날 때와 [저장]을 누를 때 검증한다
 */
export const useExpenseForm = (initialDate: string) => {
  const initial: ExpenseFormValues = {
    date: initialDate,
    title: "",
    category: null,
    amount: "",
    content: "",
  };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<
    Partial<Record<ExpenseErrorFieldType, string>>
  >({});

  const change = <TKey extends keyof ExpenseFormValues>(
    key: TKey,
    value: ExpenseFormValues[TKey],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const blur = (field: ExpenseErrorFieldType) => {
    setErrors((prev) => ({ ...prev, [field]: validate(field, values) }));
  };

  /** 모든 칸을 검증해 오류를 띄운다. 오류가 없으면 등록 요청을 만든다 */
  const submit = (): SubmitResultType => {
    const next = Object.fromEntries(
      ERROR_FIELDS.map((field) => [field, validate(field, values)]),
    );
    setErrors(next);
    const error = ERROR_FIELDS.find((field) => next[field]);
    if (error || !values.category) return { error: error ?? "category" };
    return {
      request: {
        date: values.date,
        title: values.title,
        category: values.category,
        amount: Number(values.amount),
        content: values.content || null,
        repeat: { type: "none" },
      },
    };
  };

  return {
    values,
    errors,
    /** 처음 값과 하나라도 다른지 (작성 중 나가기 확인) */
    dirty: (Object.keys(initial) as (keyof ExpenseFormValues)[]).some(
      (key) => values[key] !== initial[key],
    ),
    setDate: (date: string) => change("date", date),
    setTitle: (title: string) => change("title", title),
    setCategory: (category: CategoryType) => change("category", category),
    setAmount: (raw: string) =>
      change("amount", toDigits(raw, EXPENSE_RULES.amountDigits)),
    setContent: (content: string) => change("content", content),
    blur,
    submit,
  };
};
