import { v7 as uuidv7 } from "uuid";

import { convertToDateStr, convertToDbDate } from "@/lib/date";
import { prisma } from "@/server/db";
import type {
  CreatedExpense,
  CreateExpenseType,
  ExpenseListItem,
  ExpenseListSeriesType,
  SeriesKindType,
} from "@/types/expenseTypes";

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

/** 목록 항목의 반복 정보. 할부에 총 회차가 없으면 깨진 데이터라 에러를 낸다 */
const toListSeries = (
  series: { id: string; type: SeriesKindType; totalCount: number | null },
  seq: number,
): ExpenseListSeriesType => {
  const { id, type, totalCount } = series;
  if (type === "RECURRING") return { type, seq, totalCount };
  if (totalCount === null) {
    throw new Error(`할부 묶음에 총 회차가 없습니다: ${id}`);
  }
  return { type, seq, totalCount };
};

/** 하루 기록 목록 (데이터 아키텍처 6장 SC-03 하루 목록). 등록 순 */
export const getDayExpenses = async (
  userId: string,
  date: string,
): Promise<ExpenseListItem[]> => {
  const rows = await prisma.expense.findMany({
    where: { userId, date: convertToDbDate(date) },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      date: true,
      title: true,
      category: true,
      amount: true,
      seq: true,
      series: { select: { id: true, type: true, totalCount: true } },
    },
  });
  return rows.map(({ series, seq, ...row }) => ({
    ...row,
    date: convertToDateStr(row.date),
    ...(series && seq !== null ? { series: toListSeries(series, seq) } : {}),
  }));
};
