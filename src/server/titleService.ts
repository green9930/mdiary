import { prisma } from "@/server/db";
import { EXPENSE_RULES } from "@/shared/expenseConstants";
import type { CategoryType, TitleSuggestion } from "@/types/expenseTypes";

interface TitleRow {
  title: string;
  uses: bigint;
  lastUsedAt: Date;
  lastCategory: CategoryType;
}

/**
 * 자주 쓴 제목. 사용 횟수는 묶음 수로 센다(반복 묶음은 1번).
 * 사용 횟수 → 마지막 사용 순, 최대 300개. 앞부분·초성 일치는 화면이 거른다
 */
export const getTitles = async (userId: string): Promise<TitleSuggestion[]> => {
  // 마지막 사용 행이 여럿(같은 시각)이면 id가 큰(나중에 만든) 행의 카테고리를 쓴다
  const rows = await prisma.$queryRaw<TitleRow[]>`
    SELECT * FROM (
      SELECT DISTINCT ON (t.title)
        t.title,
        t.uses,
        t.last_used_at AS "lastUsedAt",
        e.category AS "lastCategory"
      FROM (
        SELECT title,
          COUNT(DISTINCT COALESCE("seriesId", id)) AS uses,
          MAX("createdAt") AS last_used_at
        FROM "Expense"
        WHERE "userId" = ${userId}
        GROUP BY title
        HAVING COUNT(DISTINCT COALESCE("seriesId", id)) >= ${EXPENSE_RULES.titleSuggestionMinUses}
      ) t
      JOIN "Expense" e
        ON e."userId" = ${userId}
        AND e.title = t.title
        AND e."createdAt" = t.last_used_at
      ORDER BY t.title, e.id DESC
    ) titles
    ORDER BY uses DESC, "lastUsedAt" DESC
    LIMIT ${EXPENSE_RULES.titleSuggestionLoadMax}
  `;
  return rows.map((row) => ({
    title: row.title,
    uses: Number(row.uses),
    lastUsedAt: row.lastUsedAt.toISOString(),
    lastCategory: row.lastCategory,
  }));
};
