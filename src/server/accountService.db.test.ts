import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getAccountStats } from "@/server/accountService";
import { prisma } from "@/server/db";

const userId = "account-service-user";
const otherId = "account-service-other";

const insert = (dates: string[], owner = userId) =>
  prisma.expense.createMany({
    data: dates.map((date) => ({
      id: uuidv7(),
      userId: owner,
      date: new Date(date),
      title: "기록",
      category: "ETC" as const,
      amount: 1000,
    })),
  });

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "account-service@mdiary.local" },
      { id: otherId, name: "다른", email: "account-service-o@mdiary.local" },
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

describe("getAccountStats (데이터 아키텍처 6장 전체 기록 건수)", () => {
  it("그 사용자의 전체 기록 건수를 돌려준다", async () => {
    await insert(["2026-10-18", "2023-05-01", "2030-01-01"]);
    await insert(["2026-10-18"], otherId);

    expect(await getAccountStats(userId)).toEqual({ totalCount: 3 });
  });

  it("기록이 없으면 0건", async () => {
    await insert(["2020-01-01"], otherId);

    expect(await getAccountStats(userId)).toEqual({ totalCount: 0 });
  });
});
