import { v7 as uuidv7 } from "uuid";

import {
  convertToDateStr,
  convertToDbDate,
  convertToKSTStr,
  monthOf,
} from "@/lib/date";
import { buildSeriesRows } from "@/lib/seriesUtils";
import { prisma } from "@/server/db";
import { extendContinuousSeries } from "@/server/seriesService";
import type {
  CreatedExpense,
  CreateExpenseType,
  ExpenseDetail,
  ExpenseListItem,
  ExpenseListSeriesType,
  ExpenseScopeRefused,
  SeriesKindType,
  UpdateExpenseType,
} from "@/types/expenseTypes";

/**
 * 지출 등록 (데이터 아키텍처 8-1 `POST /api/expenses`, 5-2 생성).
 * 반복이면 묶음과 모든 행을 한 트랜잭션으로 만들고 첫 행의 id·날짜를 돌려준다
 */
export const createExpense = async (
  userId: string,
  input: CreateExpenseType,
): Promise<CreatedExpense> => {
  const fields = {
    userId,
    title: input.title,
    category: input.category,
    content: input.content,
  };
  const built = buildSeriesRows(input, monthOf(convertToKSTStr()));
  if (!built) {
    const expense = await prisma.expense.create({
      data: {
        ...fields,
        id: uuidv7(),
        date: convertToDbDate(input.date),
        amount: input.amount,
      },
      select: { id: true, date: true },
    });
    return { id: expense.id, date: convertToDateStr(expense.date) };
  }

  const seriesId = uuidv7();
  const rows = built.rows.map((row) => ({ ...row, id: uuidv7() }));
  const { generatedUntil, ...series } = built.series;
  await prisma.$transaction([
    prisma.series.create({
      data: {
        ...series,
        id: seriesId,
        userId,
        generatedUntil:
          generatedUntil === null
            ? null
            : convertToDbDate(`${generatedUntil}-01`),
      },
    }),
    prisma.expense.createMany({
      data: rows.map(({ id, seq, date, amount }) => ({
        ...fields,
        id,
        seriesId,
        seq,
        date: convertToDbDate(date),
        amount,
      })),
    }),
  ]);
  const [first] = rows;
  if (!first) throw new Error(`반복 묶음에 행이 없습니다: ${seriesId}`);
  return { id: first.id, date: first.date };
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
  // 계속 반복은 그 달까지 먼저 연장한다 (데이터 아키텍처 5-4 조회 직전)
  await extendContinuousSeries({ userId, untilMonth: monthOf(date) });
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

/** 기록 1건 + 반복 정보 (데이터 아키텍처 6장 SC-08, `GET /api/expenses/:id`). 없거나 남의 기록이면 null */
export const getExpense = async (
  userId: string,
  id: string,
): Promise<ExpenseDetail | null> => {
  const row = await prisma.expense.findFirst({
    where: { id, userId },
    select: {
      id: true,
      date: true,
      title: true,
      category: true,
      amount: true,
      content: true,
      seq: true,
      series: {
        select: {
          id: true,
          type: true,
          totalCount: true,
          billingDay: true,
          isContinuous: true,
          installmentTotal: true,
        },
      },
    },
  });
  if (!row) return null;
  const { series, seq, ...expense } = row;
  const detail: ExpenseDetail = {
    expense: { ...expense, date: convertToDateStr(expense.date) },
  };
  if (!series || seq === null) return detail;

  const range = await prisma.expense.aggregate({
    where: { seriesId: series.id },
    _min: { date: true },
    _max: { date: true },
  });
  const from = range._min.date ?? row.date;
  const to = range._max.date ?? row.date;
  return {
    ...detail,
    series: {
      ...toListSeries(series, seq),
      billingDay: series.billingDay,
      isContinuous: series.isContinuous,
      installmentTotal: series.installmentTotal,
      fromMonth: monthOf(convertToDateStr(from)),
      toMonth: monthOf(convertToDateStr(to)),
    },
  };
};

// 수정·삭제할 기록을 찾는다. 반복 기록의 범위 수정·삭제는 F6 전까지 받지 않는다
const findTarget = async (
  userId: string,
  id: string,
): Promise<ExpenseScopeRefused | "ok" | null> => {
  const row = await prisma.expense.findFirst({
    where: { id, userId },
    select: { seriesId: true },
  });
  if (!row) return null;
  return row.seriesId ? { error: "SCOPE_NOT_ALLOWED" } : "ok";
};

/** 기록 수정 (데이터 아키텍처 8-1 `PATCH /api/expenses/:id`). 보낸 필드만 바꾼다. 없거나 남의 기록이면 null */
export const updateExpense = async (
  userId: string,
  id: string,
  { date, title, category, amount, content }: UpdateExpenseType,
): Promise<{ updated: number } | ExpenseScopeRefused | null> => {
  const target = await findTarget(userId, id);
  if (target !== "ok") return target;
  const { count } = await prisma.expense.updateMany({
    where: { id, userId },
    data: {
      title,
      category,
      amount,
      content,
      date: date === undefined ? undefined : convertToDbDate(date),
    },
  });
  return { updated: count };
};

/**
 * 기록 삭제 (데이터 아키텍처 8-1 `DELETE /api/expenses/:id`). 없거나 남의 기록이면 null.
 * 범위는 이 건만이다 (반복 기록의 범위 삭제는 F6)
 */
export const deleteExpense = async (
  userId: string,
  id: string,
): Promise<{ deleted: number } | ExpenseScopeRefused | null> => {
  const target = await findTarget(userId, id);
  if (target !== "ok") return target;
  const { count } = await prisma.expense.deleteMany({ where: { id, userId } });
  return { deleted: count };
};
