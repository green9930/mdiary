import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";

const userId = "db-test-user";

const expense = (overrides: Record<string, unknown> = {}) => ({
  id: uuidv7(),
  userId,
  date: new Date("2026-10-18"),
  title: "점심",
  category: "FOOD" as const,
  amount: 8000,
  ...overrides,
});

beforeAll(async () => {
  await prisma.user.create({
    data: { id: userId, name: "테스트", email: "db-test@mdiary.local" },
  });
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

describe("DB 제약 (데이터 아키텍처 7장 CHECK)", () => {
  it("올바른 지출은 저장된다", async () => {
    await expect(
      prisma.expense.create({ data: expense() }),
    ).resolves.toMatchObject({
      amount: 8000,
    });
  });

  it("금액이 1보다 작으면 거부한다", async () => {
    await expect(
      prisma.expense.create({ data: expense({ amount: 0 }) }),
    ).rejects.toThrow(/expense_amount_range/);
  });

  it("반복 묶음 없이 회차만 있으면 거부한다", async () => {
    await expect(
      prisma.expense.create({ data: expense({ seq: 1 }) }),
    ).rejects.toThrow(/expense_series_pair/);
  });

  it("결제일이 31보다 크면 거부한다", async () => {
    await expect(
      prisma.series.create({
        data: { id: uuidv7(), userId, type: "RECURRING", billingDay: 32 },
      }),
    ).rejects.toThrow(/series_billing_day/);
  });

  it("사용자를 지우면 지출도 함께 지워진다", async () => {
    const other = await prisma.user.create({
      data: {
        id: "db-test-other",
        name: "탈퇴",
        email: "db-test-other@mdiary.local",
      },
    });
    await prisma.expense.create({ data: expense({ userId: other.id }) });
    await prisma.user.delete({ where: { id: other.id } });
    expect(await prisma.expense.count({ where: { userId: other.id } })).toBe(0);
  });
});
