import { addMonths, convertToDateStr, convertToDbDate } from "@/lib/date";
import { prisma } from "@/server/db";
import type { MonthTotals } from "@/types/expenseTypes";

interface DayTotalRow {
  date: Date;
  total: bigint;
}

/** 한 달의 날짜별 합계와 월 합계 (데이터 아키텍처 6장, `GET /api/calendar`). 기록이 있는 날만 준다 */
export const getMonthTotals = async (
  userId: string,
  month: string,
): Promise<MonthTotals> => {
  const from = convertToDbDate(`${month}-01`);
  const to = convertToDbDate(`${addMonths(month, 1)}-01`);
  // SUM(int)은 bigint다. 한 달 합계는 Int 범위를 넘을 수 있다
  const rows = await prisma.$queryRaw<DayTotalRow[]>`
    SELECT date, SUM(amount) AS total
    FROM "Expense"
    WHERE "userId" = ${userId} AND date >= ${from} AND date < ${to}
    GROUP BY date
    ORDER BY date
  `;
  const days = rows.map((row) => ({
    date: convertToDateStr(row.date),
    total: Number(row.total),
  }));
  return { total: days.reduce((sum, day) => sum + day.total, 0), days };
};
