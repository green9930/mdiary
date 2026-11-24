import { prisma } from "@/server/db";

interface AccountStats {
  totalCount: number;
}

/** 저장된 모든 기록 건수 (데이터 아키텍처 6장, `GET /api/me`) */
export const getAccountStats = async (
  userId: string,
): Promise<AccountStats> => {
  const totalCount = await prisma.expense.count({ where: { userId } });
  return { totalCount };
};
