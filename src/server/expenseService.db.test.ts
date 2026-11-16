import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";
import { createExpense } from "@/server/expenseService";

const userId = "expense-service-user";

beforeAll(async () => {
  await prisma.user.create({
    data: { id: userId, name: "테스트", email: "expense-service@mdiary.local" },
  });
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: userId } });
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
