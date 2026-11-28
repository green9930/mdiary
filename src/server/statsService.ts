import { addMonths, convertToDbDate } from "@/lib/date";
import { prisma } from "@/server/db";
import { extendContinuousSeries } from "@/server/seriesService";
import { CATEGORY_LIST } from "@/shared/expenseConstants";
import type { CategoryStats, CategoryType, Period } from "@/types/expenseTypes";

interface CategoryTotalRow {
  category: CategoryType;
  total: bigint;
  count: bigint;
}

const categoryOrder = (category: CategoryType) =>
  CATEGORY_LIST.findIndex((item) => item.value === category);

/**
 * 기간의 총액·건수와 카테고리별 합계 (데이터 아키텍처 6장, `GET /api/stats`).
 * 지출이 있는 카테고리만, 금액 내림차순이고 같으면 카테고리 고정 순서다.
 * 계속 반복은 끝 달까지 먼저 연장한다 (5-4 조회 직전)
 */
export const getCategoryStats = async (
  userId: string,
  { from, to }: Period,
): Promise<CategoryStats> => {
  await extendContinuousSeries({ userId, untilMonth: to });
  const start = convertToDbDate(`${from}-01`);
  const end = convertToDbDate(`${addMonths(to, 1)}-01`);
  // SUM(int)·COUNT는 bigint다. 기간 합계는 Int 범위를 넘을 수 있다
  const rows = await prisma.$queryRaw<CategoryTotalRow[]>`
    SELECT category, SUM(amount) AS total, COUNT(*) AS count
    FROM "Expense"
    WHERE "userId" = ${userId} AND date >= ${start} AND date < ${end}
    GROUP BY category
  `;
  const categories = rows
    .map((row) => ({
      category: row.category,
      total: Number(row.total),
      count: Number(row.count),
    }))
    .sort(
      (a, b) =>
        b.total - a.total ||
        categoryOrder(a.category) - categoryOrder(b.category),
    );
  return {
    total: categories.reduce((sum, row) => sum + row.total, 0),
    count: categories.reduce((sum, row) => sum + row.count, 0),
    categories,
  };
};
