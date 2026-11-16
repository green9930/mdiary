import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";
import { getTitles } from "@/server/titleService";
import type { CategoryType } from "@/types/expenseTypes";

const userId = "title-service-user";
const otherId = "title-service-other";

interface Row {
  title: string;
  category?: CategoryType;
  createdAt: string;
  seriesId?: string;
  seq?: number;
  owner?: string;
}

const insert = (rows: Row[]) =>
  prisma.expense.createMany({
    data: rows.map((row) => ({
      id: uuidv7(),
      userId: row.owner ?? userId,
      date: new Date("2026-10-18"),
      title: row.title,
      category: row.category ?? "ETC",
      amount: 1000,
      seriesId: row.seriesId ?? null,
      seq: row.seq ?? null,
      createdAt: new Date(row.createdAt),
    })),
  });

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "title-service@mdiary.local" },
      { id: otherId, name: "다른", email: "title-service-other@mdiary.local" },
    ],
  });
});

beforeEach(async () => {
  await prisma.expense.deleteMany({
    where: { userId: { in: [userId, otherId] } },
  });
  await prisma.series.deleteMany({ where: { userId } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await prisma.$disconnect();
});

describe("getTitles (데이터 아키텍처 6장 제목 추천 목록)", () => {
  it("2번 이상 쓴 제목만 돌려준다", async () => {
    await insert([
      { title: "점심", createdAt: "2026-10-01T00:00:00Z" },
      { title: "점심", createdAt: "2026-10-02T00:00:00Z" },
      { title: "한 번", createdAt: "2026-10-03T00:00:00Z" },
    ]);

    expect((await getTitles(userId)).map((t) => t.title)).toEqual(["점심"]);
  });

  it("반복 묶음은 건수와 상관없이 1번으로 센다", async () => {
    const seriesId = uuidv7();
    await prisma.series.create({
      data: { id: seriesId, userId, type: "RECURRING", billingDay: 18 },
    });
    await insert([
      { title: "월세", seriesId, seq: 1, createdAt: "2026-10-01T00:00:00Z" },
      { title: "월세", seriesId, seq: 2, createdAt: "2026-10-01T00:00:00Z" },
      { title: "월세", seriesId, seq: 3, createdAt: "2026-10-01T00:00:00Z" },
    ]);
    expect(await getTitles(userId)).toEqual([]);

    await insert([{ title: "월세", createdAt: "2026-10-05T00:00:00Z" }]);
    expect(await getTitles(userId)).toMatchObject([{ title: "월세", uses: 2 }]);
  });

  it("사용 횟수 → 마지막 사용 순으로 정렬한다", async () => {
    await insert([
      { title: "커피", createdAt: "2026-10-01T00:00:00Z" },
      { title: "커피", createdAt: "2026-10-02T00:00:00Z" },
      { title: "점심", createdAt: "2026-10-01T00:00:00Z" },
      { title: "점심", createdAt: "2026-10-03T00:00:00Z" },
      { title: "쿠팡", createdAt: "2026-09-01T00:00:00Z" },
      { title: "쿠팡", createdAt: "2026-09-02T00:00:00Z" },
      { title: "쿠팡", createdAt: "2026-09-03T00:00:00Z" },
    ]);

    expect((await getTitles(userId)).map((t) => t.title)).toEqual([
      "쿠팡",
      "점심",
      "커피",
    ]);
  });

  it("마지막으로 쓴 때와 그때의 카테고리를 돌려준다", async () => {
    await insert([
      { title: "쿠팡", category: "LIVING", createdAt: "2026-10-01T00:00:00Z" },
      { title: "쿠팡", category: "FOOD", createdAt: "2026-10-05T00:00:00Z" },
    ]);

    expect(await getTitles(userId)).toEqual([
      {
        title: "쿠팡",
        uses: 2,
        lastUsedAt: "2026-10-05T00:00:00.000Z",
        lastCategory: "FOOD",
      },
    ]);
  });

  it("대소문자가 다르면 다른 제목이다", async () => {
    await insert([
      { title: "Netflix", createdAt: "2026-10-01T00:00:00Z" },
      { title: "netflix", createdAt: "2026-10-02T00:00:00Z" },
    ]);

    expect(await getTitles(userId)).toEqual([]);
  });

  it("다른 사용자의 기록은 세지 않는다", async () => {
    await insert([
      { title: "점심", createdAt: "2026-10-01T00:00:00Z" },
      { title: "점심", owner: otherId, createdAt: "2026-10-02T00:00:00Z" },
    ]);

    expect(await getTitles(userId)).toEqual([]);
  });

  it("최대 300개까지 돌려준다", async () => {
    await insert(
      Array.from({ length: 301 }, (_, i) => [
        { title: `제목${i}`, createdAt: "2026-10-01T00:00:00Z" },
        { title: `제목${i}`, createdAt: "2026-10-02T00:00:00Z" },
      ]).flat(),
    );

    expect(await getTitles(userId)).toHaveLength(300);
  });
});
