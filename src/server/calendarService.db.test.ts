import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getMonthTotals } from "@/server/calendarService";
import { prisma } from "@/server/db";

const userId = "calendar-service-user";
const otherId = "calendar-service-other";

const insert = (rows: { date: string; amount: number; owner?: string }[]) =>
  prisma.expense.createMany({
    data: rows.map((row) => ({
      id: uuidv7(),
      userId: row.owner ?? userId,
      date: new Date(row.date),
      title: "기록",
      category: "ETC" as const,
      amount: row.amount,
    })),
  });

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "calendar-service@mdiary.local" },
      { id: otherId, name: "다른", email: "calendar-service-o@mdiary.local" },
    ],
  });
});

beforeEach(async () => {
  await prisma.expense.deleteMany({
    where: { userId: { in: [userId, otherId] } },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await prisma.$disconnect();
});

describe("getMonthTotals (데이터 아키텍처 6장 SC-03 날짜별 합계, 월 합계)", () => {
  it("그 달의 날짜별 합계를 날짜 순으로, 월 합계와 함께 돌려준다", async () => {
    await insert([
      { date: "2026-10-18", amount: 8000 },
      { date: "2026-10-18", amount: 13300 },
      { date: "2026-10-01", amount: 5000 },
      { date: "2026-10-31", amount: 1000 },
    ]);

    expect(await getMonthTotals(userId, "2026-10")).toEqual({
      total: 27300,
      days: [
        { date: "2026-10-01", total: 5000 },
        { date: "2026-10-18", total: 21300 },
        { date: "2026-10-31", total: 1000 },
      ],
    });
  });

  it("다른 달과 다른 사용자의 기록은 넣지 않는다", async () => {
    await insert([
      { date: "2026-09-30", amount: 1000 },
      { date: "2026-11-01", amount: 1000 },
      { date: "2026-10-05", amount: 1000, owner: otherId },
    ]);

    expect(await getMonthTotals(userId, "2026-10")).toEqual({
      total: 0,
      days: [],
    });
  });

  it("합계가 Int 범위를 넘어도 정확히 더한다", async () => {
    await insert([
      { date: "2026-10-01", amount: 999_999_999 },
      { date: "2026-10-01", amount: 999_999_999 },
      { date: "2026-10-02", amount: 999_999_999 },
    ]);

    expect((await getMonthTotals(userId, "2026-10")).total).toBe(2_999_999_997);
  });
});

describe("getMonthTotals 조회 직전 연장 (데이터 아키텍처 5-4)", () => {
  it("요청한 달까지 계속 반복을 먼저 연장해 합계에 넣는다", async () => {
    const seriesId = uuidv7();
    await prisma.series.create({
      data: {
        id: seriesId,
        userId,
        type: "RECURRING",
        billingDay: 31,
        isContinuous: true,
        generatedUntil: new Date("2027-01-01"),
      },
    });
    await prisma.expense.create({
      data: {
        id: uuidv7(),
        userId,
        seriesId,
        seq: 1,
        date: new Date("2027-01-31"),
        title: "월세",
        category: "LIVING",
        amount: 500000,
      },
    });

    expect(await getMonthTotals(userId, "2027-02")).toEqual({
      total: 500000,
      days: [{ date: "2027-02-28", total: 500000 }],
    });
  });
});
