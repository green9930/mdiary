import { v7 as uuidv7 } from "uuid";

import {
  addMonths,
  convertToDateStr,
  convertToDbDate,
  monthOf,
} from "@/lib/date";
import { alignBillingDate, listMonths } from "@/lib/seriesUtils";
import { prisma } from "@/server/db";
import { DATE_RULES } from "@/shared/sharedConstants";

interface LockedSeries {
  billingDay: number;
  isContinuous: boolean;
  generatedUntil: Date | null;
}

const MAX_MONTH = monthOf(DATE_RULES.maxDate);

// 묶음 하나를 목표 달까지 연장한다. 만든 행 수를 돌려준다.
// 묶음 행을 잠그고 generatedUntil을 다시 읽어, 동시에 돌아도 같은 달을 두 번 만들지 않는다
const extendOne = (id: string, target: string) =>
  prisma.$transaction(async (tx) => {
    const [series] = await tx.$queryRaw<LockedSeries[]>`
      SELECT "billingDay", "isContinuous", "generatedUntil"
      FROM "Series" WHERE id = ${id}::uuid FOR UPDATE
    `;
    if (!series?.isContinuous || !series.generatedUntil) return 0;
    const from = addMonths(monthOf(convertToDateStr(series.generatedUntil)), 1);
    const months = listMonths(from, target);
    // 본뜰 행: 묶음에서 seq가 가장 큰 행. 모두 지웠으면 만들지 않는다
    const last = await tx.expense.findFirst({
      where: { seriesId: id },
      orderBy: { seq: "desc" },
    });
    if (months.length === 0 || !last || last.seq === null) return 0;

    const lastSeq = last.seq;
    await tx.expense.createMany({
      data: months.map((month, index) => ({
        id: uuidv7(),
        userId: last.userId,
        seriesId: id,
        seq: lastSeq + index + 1,
        date: convertToDbDate(alignBillingDate(month, series.billingDay)),
        title: last.title,
        category: last.category,
        amount: last.amount,
        content: last.content,
      })),
    });
    await tx.series.update({
      where: { id },
      data: { generatedUntil: convertToDbDate(`${target}-01`) },
    });
    return months.length;
  });

/**
 * 계속 반복하는 정기지출을 목표 달까지 연장한다 (데이터 아키텍처 5-4).
 * userId가 있으면 그 사용자 것만 (조회 직전), 없으면 모두 (정기 작업).
 * 목표 달은 2099년 12월을 넘지 않는다. 연장한 묶음 수와 만든 행 수를 돌려준다
 */
export const extendContinuousSeries = async ({
  userId,
  untilMonth,
}: {
  userId?: string;
  untilMonth: string;
}): Promise<{ series: number; created: number }> => {
  const target = untilMonth > MAX_MONTH ? MAX_MONTH : untilMonth;
  const candidates = await prisma.series.findMany({
    where: {
      ...(userId ? { userId } : {}),
      isContinuous: true,
      generatedUntil: { lt: convertToDbDate(`${target}-01`) },
    },
    select: { id: true },
  });

  let series = 0;
  let created = 0;
  for (const { id } of candidates) {
    const count = await extendOne(id, target);
    if (count > 0) series += 1;
    created += count;
  }
  return { series, created };
};
