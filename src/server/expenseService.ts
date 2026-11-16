import { v7 as uuidv7 } from "uuid";

import { convertToDateStr, convertToDbDate } from "@/lib/date";
import { prisma } from "@/server/db";
import type { CreatedExpense, CreateExpenseType } from "@/types/expenseTypes";

/** 지출 등록 (데이터 아키텍처 8-1 `POST /api/expenses`). 반복은 F6 전까지 없음만 */
export const createExpense = async (
  userId: string,
  input: CreateExpenseType,
): Promise<CreatedExpense> => {
  const expense = await prisma.expense.create({
    data: {
      id: uuidv7(),
      userId,
      date: convertToDbDate(input.date),
      title: input.title,
      category: input.category,
      amount: input.amount,
      content: input.content,
    },
    select: { id: true, date: true },
  });
  return { id: expense.id, date: convertToDateStr(expense.date) };
};
