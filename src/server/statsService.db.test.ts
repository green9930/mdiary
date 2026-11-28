import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";
import { getCategoryStats } from "@/server/statsService";
import type { CategoryType } from "@/types/expenseTypes";

const userId = "stats-service-user";
const otherId = "stats-service-other";

const insert = (
  rows: {
    date: string;
    amount: number;
    category: CategoryType;
    owner?: string;
  }[],
) =>
  prisma.expense.createMany({
    data: rows.map((row) => ({
      id: uuidv7(),
      userId: row.owner ?? userId,
      date: new Date(row.date),
      title: "기록",
      category: row.category,
      amount: row.amount,
    })),
  });

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "stats-service@mdiary.local" },
      { id: otherId, name: "다른", email: "stats-service-o@mdiary.local" },
    ],
  });
});

beforeEach(async () => {
  await prisma.expense.deleteMany({
    where: { userId: { in: [userId, otherId] } },
  });
  await prisma.series.deleteMany({
    where: { userId: { in: [userId, otherId] } },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await prisma.$disconnect();
});

describe("getCategoryStats (데이터 아키텍처 6장 SC-04 기간 총액·건수, 카테고리별 합계)", () => {
  it("기간의 총액·건수와 카테고리별 합계를 금액 내림차순으로", async () => {
    await insert([
      { date: "2026-09-01", amount: 8000, category: "FOOD" },
      { date: "2026-10-31", amount: 2000, category: "FOOD" },
      { date: "2026-10-05", amount: 50000, category: "LIVING" },
      { date: "2026-10-06", amount: 900, category: "MEDICAL" },
    ]);

    expect(
      await getCategoryStats(userId, { from: "2026-09", to: "2026-10" }),
    ).toEqual({
      total: 60900,
      count: 4,
      categories: [
        { category: "LIVING", total: 50000, count: 1 },
        { category: "FOOD", total: 10000, count: 2 },
        { category: "MEDICAL", total: 900, count: 1 },
      ],
    });
  });

  it("금액이 같으면 카테고리 고정 순서", async () => {
    await insert([
      { date: "2026-10-01", amount: 1000, category: "ETC" },
      { date: "2026-10-01", amount: 1000, category: "APPLIANCE" },
      { date: "2026-10-01", amount: 1000, category: "FOOD" },
    ]);

    const stats = await getCategoryStats(userId, {
      from: "2026-10",
      to: "2026-10",
    });
    expect(stats.categories.map(({ category }) => category)).toEqual([
      "FOOD",
      "APPLIANCE",
      "ETC",
    ]);
  });

  it("기간은 시작 달 1일 ~ 끝 달 말일. 다른 사용자의 기록은 넣지 않는다", async () => {
    await insert([
      { date: "2026-08-31", amount: 1000, category: "FOOD" },
      { date: "2026-11-01", amount: 1000, category: "FOOD" },
      { date: "2026-10-05", amount: 1000, category: "FOOD", owner: otherId },
    ]);

    expect(
      await getCategoryStats(userId, { from: "2026-09", to: "2026-10" }),
    ).toEqual({ total: 0, count: 0, categories: [] });
  });

  it("합계가 Int 범위를 넘어도 정확히 더한다", async () => {
    await insert([
      { date: "2026-10-01", amount: 999_999_999, category: "FOOD" },
      { date: "2026-10-02", amount: 999_999_999, category: "FOOD" },
      { date: "2026-10-03", amount: 999_999_999, category: "LIVING" },
    ]);

    const stats = await getCategoryStats(userId, {
      from: "2026-10",
      to: "2026-10",
    });
    expect(stats.total).toBe(2_999_999_997);
    expect(stats.categories[0]).toEqual({
      category: "FOOD",
      total: 1_999_999_998,
      count: 2,
    });
  });

  it("조회 직전에 계속 반복을 끝 달까지 연장한다 (데이터 아키텍처 5-4)", async () => {
    const seriesId = uuidv7();
    await prisma.series.create({
      data: {
        id: seriesId,
        userId,
        type: "RECURRING",
        billingDay: 10,
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
        date: new Date("2027-01-10"),
        title: "월세",
        category: "LIVING",
        amount: 500000,
      },
    });

    expect(
      await getCategoryStats(userId, { from: "2027-01", to: "2027-03" }),
    ).toEqual({
      total: 1_500_000,
      count: 3,
      categories: [{ category: "LIVING", total: 1_500_000, count: 3 }],
    });
  });
});
