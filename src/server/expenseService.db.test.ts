import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";
import { createExpense, getDayExpenses } from "@/server/expenseService";

const userId = "expense-service-user";
const otherId = "expense-service-other";

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "expense-service@mdiary.local" },
      { id: otherId, name: "다른", email: "expense-service-o@mdiary.local" },
    ],
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await prisma.$disconnect();
});

describe("createExpense (데이터 아키텍처 8-1 POST /api/expenses)", () => {
  it("반복 없는 기록을 그 사용자의 기록으로 저장하고 id와 날짜를 돌려준다", async () => {
    const result = await createExpense(userId, {
      date: "2026-10-18",
      title: "점심",
      category: "FOOD",
      amount: 8000,
      content: "참치김밥",
      repeat: { type: "none" },
    });

    expect(result.date).toBe("2026-10-18");
    const saved = await prisma.expense.findUniqueOrThrow({
      where: { id: result.id },
    });
    expect(saved).toMatchObject({
      userId,
      title: "점심",
      category: "FOOD",
      amount: 8000,
      content: "참치김밥",
      seriesId: null,
      seq: null,
    });
    expect(saved.date.toISOString().slice(0, 10)).toBe("2026-10-18");
  });

  it("id는 시간순으로 정렬되는 UUID v7이다", async () => {
    const result = await createExpense(userId, {
      date: "2026-10-18",
      title: "커피",
      category: "FOOD",
      amount: 4500,
      content: null,
      repeat: { type: "none" },
    });

    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
  });
});

describe("getDayExpenses (데이터 아키텍처 6장 SC-03 하루 목록)", () => {
  const day = "2026-09-07";

  it("그날 기록을 등록 순으로 목록 항목 모양으로 돌려준다", async () => {
    const recurringId = uuidv7();
    const installmentId = uuidv7();
    await prisma.series.createMany({
      data: [
        { id: recurringId, userId, type: "RECURRING", billingDay: 7 },
        {
          id: installmentId,
          userId,
          type: "INSTALLMENT",
          billingDay: 7,
          totalCount: 12,
          installmentTotal: 1_200_000,
        },
      ],
    });
    const base = {
      userId,
      date: new Date(day),
      category: "ETC" as const,
      amount: 1000,
    };
    const ids = [uuidv7(), uuidv7(), uuidv7(), uuidv7()] as const;
    await prisma.expense.createMany({
      data: [
        {
          ...base,
          id: ids[0],
          title: "늦게 등록",
          createdAt: new Date("2026-09-07T10:00:00Z"),
        },
        {
          ...base,
          id: ids[1],
          title: "아이패드",
          amount: 100_000,
          seriesId: installmentId,
          seq: 3,
          createdAt: new Date("2026-09-01T00:00:00Z"),
        },
        {
          ...base,
          id: ids[2],
          title: "넷플릭스",
          seriesId: recurringId,
          seq: 2,
          createdAt: new Date("2026-09-03T00:00:00Z"),
        },
        {
          ...base,
          id: ids[3],
          title: "다른 날",
          date: new Date("2026-09-08"),
        },
      ],
    });

    expect(await getDayExpenses(userId, day)).toEqual([
      {
        id: ids[1],
        date: day,
        title: "아이패드",
        category: "ETC",
        amount: 100_000,
        series: { type: "INSTALLMENT", seq: 3, totalCount: 12 },
      },
      {
        id: ids[2],
        date: day,
        title: "넷플릭스",
        category: "ETC",
        amount: 1000,
        series: { type: "RECURRING", seq: 2, totalCount: null },
      },
      {
        id: ids[0],
        date: day,
        title: "늦게 등록",
        category: "ETC",
        amount: 1000,
      },
    ]);
  });

  it("같은 시각에 등록한 기록은 id 순이다", async () => {
    const createdAt = new Date("2026-09-10T00:00:00Z");
    const ids = [uuidv7(), uuidv7()] as const;
    await prisma.expense.createMany({
      data: [ids[1], ids[0]].map((id) => ({
        id,
        userId,
        date: new Date("2026-09-10"),
        title: id,
        category: "ETC" as const,
        amount: 1000,
        createdAt,
      })),
    });

    expect(
      (await getDayExpenses(userId, "2026-09-10")).map((item) => item.id),
    ).toEqual(ids);
  });

  it("총 회차가 없는 할부는 깨진 데이터라 에러를 낸다", async () => {
    const seriesId = uuidv7();
    await prisma.series.create({
      data: { id: seriesId, userId, type: "INSTALLMENT", billingDay: 12 },
    });
    await prisma.expense.create({
      data: {
        id: uuidv7(),
        userId,
        date: new Date("2026-09-12"),
        title: "총 회차 없는 할부",
        category: "ETC",
        amount: 1000,
        seriesId,
        seq: 1,
      },
    });

    await expect(getDayExpenses(userId, "2026-09-12")).rejects.toThrow(
      seriesId,
    );
  });

  it("다른 사용자의 기록은 넣지 않는다", async () => {
    await prisma.expense.create({
      data: {
        id: uuidv7(),
        userId: otherId,
        date: new Date("2026-09-11"),
        title: "남의 기록",
        category: "ETC",
        amount: 1000,
      },
    });

    expect(await getDayExpenses(userId, "2026-09-11")).toEqual([]);
  });
});
