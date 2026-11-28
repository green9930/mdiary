import {
  addMonths,
  convertToDateStr,
  convertToDbDate,
  monthDiff,
  monthOf,
} from "@/lib/date";
import { alignBillingDate } from "@/lib/seriesUtils";
import { prisma } from "@/server/db";
import { extendContinuousSeries } from "@/server/seriesService";
import type {
  ExpenseScopeRefused,
  ScopePreview,
  ScopeType,
  UpdateExpenseType,
} from "@/types/expenseTypes";

// 반복 기록의 범위 수정·삭제·미리보기 (데이터 아키텍처 5-3·5-5·5-6).
// 범위의 기준은 사용자가 연 건(이 건, seq = k)이다. 그보다 앞선 건은 어떤 범위에서도 바뀌지 않는다

const REFUSED: ExpenseScopeRefused = { error: "SCOPE_NOT_ALLOWED" };

interface ScopeRow {
  id: string;
  seq: number | null;
  date: string;
}

// 이 건과 묶음. 없거나 남의 기록이면 null
const findTarget = async (userId: string, id: string) => {
  const row = await prisma.expense.findFirst({
    where: { id, userId },
    select: {
      id: true,
      seq: true,
      date: true,
      series: {
        select: {
          id: true,
          isContinuous: true,
          generatedUntil: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    seq: row.seq,
    date: convertToDateStr(row.date),
    series: row.series && {
      id: row.series.id,
      isContinuous: row.series.isContinuous,
      generatedUntil:
        row.series.generatedUntil &&
        monthOf(convertToDateStr(row.series.generatedUntil)),
    },
  };
};

type TargetType = NonNullable<Awaited<ReturnType<typeof findTarget>>>;

/**
 * 날짜를 바꿨을 때 고를 수 있는 범위인지 (D11). Δ = 새 날짜의 달 − 이 건의 달.
 * 이번 건만은 언제나, 이후 전체는 Δ ≥ 0, 이 건부터 N개월은 Δ = 0
 */
const isAllowed = (scope: ScopeType, delta: number) =>
  scope.type === "one" || (scope.type === "after" ? delta >= 0 : delta === 0);

// 묶음에서 seq ≥ k인 행 (seq 순)
const rowsFrom = async (seriesId: string, seq: number): Promise<ScopeRow[]> =>
  (
    await prisma.expense.findMany({
      where: { seriesId, seq: { gte: seq } },
      orderBy: { seq: "asc" },
      select: { id: true, seq: true, date: true },
    })
  ).map((row) => ({ ...row, date: convertToDateStr(row.date) }));

/**
 * 범위 안의 행. 고를 수 없는 범위면 null.
 * 계속 반복에서 N이 만들어 둔 행보다 많으면 먼저 연장한다 (5-3)
 */
const resolveRows = async (
  userId: string,
  target: TargetType,
  scope: ScopeType,
): Promise<ScopeRow[] | null> => {
  const self = { id: target.id, seq: target.seq, date: target.date };
  if (scope.type === "one") return [self];
  const { series, seq } = target;
  if (!series || seq === null) return null;

  let rows = await rowsFrom(series.id, seq);
  if (scope.type === "after") return rows;
  if (rows.length < scope.n) {
    if (!series.isContinuous || !series.generatedUntil) return null;
    await extendContinuousSeries({
      userId,
      untilMonth: addMonths(series.generatedUntil, scope.n - rows.length),
    });
    rows = await rowsFrom(series.id, seq);
  }
  return rows.length < scope.n ? null : rows.slice(0, scope.n);
};

// 묶음 행을 잠근다. 연장(5-4)과 동시에 돌아도 행이 엇갈리지 않게 한다
type TransactionClientType = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

const lockSeries = (tx: TransactionClientType, seriesId: string) =>
  tx.$queryRaw`SELECT id FROM "Series" WHERE id = ${seriesId}::uuid FOR UPDATE`;

/**
 * 기록 수정 (데이터 아키텍처 8-1 `PATCH /api/expenses/:id`, 5-3).
 * 제목·카테고리·금액·내용은 범위 안 모든 행에 같게, 날짜는 범위에 따라 옮긴다.
 * 없거나 남의 기록이면 null, 고를 수 없는 범위면 SCOPE_NOT_ALLOWED
 */
export const updateExpense = async (
  userId: string,
  id: string,
  { scope, date, ...fields }: UpdateExpenseType,
): Promise<{ updated: number } | ExpenseScopeRefused | null> => {
  const target = await findTarget(userId, id);
  if (!target) return null;
  const delta = date === undefined ? 0 : monthDiff(target.date, date);
  if (!isAllowed(scope, delta)) return REFUSED;
  const rows = await resolveRows(userId, target, scope);
  if (!rows) return REFUSED;

  const { series } = target;
  await prisma.$transaction(async (tx) => {
    if (series) await lockSeries(tx, series.id);
    await tx.expense.updateMany({
      where: { id: { in: rows.map((row) => row.id) } },
      data: fields,
    });
    if (date === undefined) return;
    if (scope.type === "one") {
      await tx.expense.update({
        where: { id },
        data: { date: convertToDbDate(date) },
      });
      return;
    }
    // 각 행을 Δ개월 옮기고 일을 새 일로 (그 달에 없으면 말일)
    const day = Number(date.slice(8, 10));
    for (const row of rows)
      await tx.expense.update({
        where: { id: row.id },
        data: {
          date: convertToDbDate(
            alignBillingDate(addMonths(monthOf(row.date), delta), day),
          ),
        },
      });
    if (scope.type === "after" && series)
      await tx.series.update({
        where: { id: series.id },
        data: {
          billingDay: day,
          ...(series.generatedUntil && delta > 0
            ? {
                generatedUntil: convertToDbDate(
                  `${addMonths(series.generatedUntil, delta)}-01`,
                ),
              }
            : {}),
        },
      });
  });
  return { updated: rows.length };
};

/**
 * 기록 삭제 (데이터 아키텍처 8-1 `DELETE /api/expenses/:id`, 5-5).
 * 계속 반복의 이후 전체는 반복을 끝낸다. 남은 행이 없고 계속 반복이 아니면 묶음도 지운다.
 * 없거나 남의 기록이면 null, 고를 수 없는 범위면 SCOPE_NOT_ALLOWED
 */
export const deleteExpense = async (
  userId: string,
  id: string,
  scope: ScopeType,
): Promise<{ deleted: number } | ExpenseScopeRefused | null> => {
  const target = await findTarget(userId, id);
  if (!target) return null;
  const rows = await resolveRows(userId, target, scope);
  if (!rows) return REFUSED;

  const { series } = target;
  await prisma.$transaction(async (tx) => {
    if (series) await lockSeries(tx, series.id);
    await tx.expense.deleteMany({
      where: { id: { in: rows.map((row) => row.id) } },
    });
    if (!series) return;
    const ended = series.isContinuous && scope.type === "after";
    if (ended)
      await tx.series.update({
        where: { id: series.id },
        data: { isContinuous: false },
      });
    const left = await tx.expense.count({ where: { seriesId: series.id } });
    if (left === 0 && (!series.isContinuous || ended))
      await tx.series.delete({ where: { id: series.id } });
  });
  return { deleted: rows.length };
};

/**
 * 범위 미리보기 (데이터 아키텍처 8-1 `GET /api/expenses/:id/scope`, 5-6).
 * date는 수정에서 바꾼 날짜다. 뒤 달로 바꾼 이후 전체는 민 달을 보여 준다.
 * 없거나 남의 기록이면 null, 고를 수 없는 범위면 SCOPE_NOT_ALLOWED
 */
export const getScopePreview = async (
  userId: string,
  id: string,
  scope: ScopeType,
  date?: string,
): Promise<ScopePreview | ExpenseScopeRefused | null> => {
  const target = await findTarget(userId, id);
  if (!target) return null;
  const delta = date === undefined ? 0 : monthDiff(target.date, date);
  if (!isAllowed(scope, delta)) return REFUSED;

  const { series, seq } = target;
  const remainingRows =
    series && seq !== null ? await rowsFrom(series.id, seq) : [];
  const remaining = series?.isContinuous ? null : remainingRows.length || 1;

  if (scope.type === "one") {
    const month = monthOf(date ?? target.date);
    return {
      remaining,
      affected: {
        count: 1,
        fromMonth: month,
        toMonth: month,
        continuous: false,
      },
    };
  }

  const shift = (row: ScopeRow | undefined) =>
    addMonths(monthOf(row?.date ?? target.date), delta);
  if (scope.type === "after" && series?.isContinuous)
    return {
      remaining,
      affected: {
        count: null,
        fromMonth: shift(remainingRows[0]),
        toMonth: null,
        continuous: true,
      },
    };

  const rows =
    scope.type === "after"
      ? remainingRows
      : await resolveRows(userId, target, scope);
  if (!rows || rows.length === 0) return REFUSED;
  return {
    remaining,
    affected: {
      count: rows.length,
      fromMonth: shift(rows[0]),
      toMonth: shift(rows.at(-1)),
      continuous: false,
    },
  };
};
