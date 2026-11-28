import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { convertToDateStr, convertToDbDate } from "@/lib/date";
import { prisma } from "@/server/db";
import { extendContinuousSeries } from "@/server/seriesService";

const userId = "series-service-user";
const otherId = "series-service-other";

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "series-service@mdiary.local" },
      { id: otherId, name: "다른", email: "series-service-o@mdiary.local" },
    ],
  });
});

beforeEach(async () => {
  await prisma.series.deleteMany({
    where: { userId: { in: [userId, otherId] } },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await prisma.$disconnect();
});

/** 계속 반복 묶음과 행을 만든다. rows는 [seq, 날짜, 금액] */
const seedSeries = async (
  owner: string,
  {
    billingDay = 31,
    generatedUntil = "2026-12",
    isContinuous = true,
    rows,
  }: {
    billingDay?: number;
    generatedUntil?: string;
    isContinuous?: boolean;
    rows: [number, string, number][];
  },
) => {
  const id = uuidv7();
  await prisma.series.create({
    data: {
      id,
      userId: owner,
      type: "RECURRING",
      billingDay,
      isContinuous,
      generatedUntil: convertToDbDate(`${generatedUntil}-01`),
    },
  });
  await prisma.expense.createMany({
    data: rows.map(([seq, date, amount]) => ({
      id: uuidv7(),
      userId: owner,
      seriesId: id,
      seq,
      date: convertToDbDate(date),
      title: `월세 ${seq}`,
      category: "LIVING" as const,
      amount,
      content: seq === 1 ? null : "관리비 포함",
    })),
  });
  return id;
};

const rowsOf = async (seriesId: string) =>
  (
    await prisma.expense.findMany({
      where: { seriesId },
      orderBy: { seq: "asc" },
    })
  ).map((row) => ({
    seq: row.seq,
    date: convertToDateStr(row.date),
    title: row.title,
    amount: row.amount,
    content: row.content,
  }));

const generatedUntilOf = async (id: string) => {
  const series = await prisma.series.findUniqueOrThrow({ where: { id } });
  return series.generatedUntil && convertToDateStr(series.generatedUntil);
};

describe("extendContinuousSeries (데이터 아키텍처 5-4)", () => {
  it("generatedUntil 다음 달부터 목표 달까지 마지막 행을 본떠 만들고 generatedUntil을 옮긴다", async () => {
    const id = await seedSeries(userId, {
      rows: [
        [1, "2026-10-31", 500000],
        [2, "2026-11-30", 500000],
        [3, "2026-12-31", 550000],
      ],
    });

    expect(
      await extendContinuousSeries({ userId, untilMonth: "2027-03" }),
    ).toEqual({ series: 1, created: 3 });

    expect((await rowsOf(id)).slice(3)).toEqual([
      {
        seq: 4,
        date: "2027-01-31",
        title: "월세 3",
        amount: 550000,
        content: "관리비 포함",
      },
      {
        seq: 5,
        date: "2027-02-28",
        title: "월세 3",
        amount: 550000,
        content: "관리비 포함",
      },
      {
        seq: 6,
        date: "2027-03-31",
        title: "월세 3",
        amount: 550000,
        content: "관리비 포함",
      },
    ]);
    expect(await generatedUntilOf(id)).toBe("2027-03-01");
  });

  it("사용자가 지운 달은 다시 만들지 않고, 두 번 돌려도 결과가 같다", async () => {
    // 11월(seq 2)을 지운 상태
    const id = await seedSeries(userId, {
      rows: [
        [1, "2026-10-31", 500000],
        [3, "2026-12-31", 500000],
      ],
    });

    await extendContinuousSeries({ userId, untilMonth: "2027-01" });
    expect(
      await extendContinuousSeries({ userId, untilMonth: "2027-01" }),
    ).toEqual({ series: 0, created: 0 });

    expect((await rowsOf(id)).map(({ seq, date }) => [seq, date])).toEqual([
      [1, "2026-10-31"],
      [3, "2026-12-31"],
      [4, "2027-01-31"],
    ]);
  });

  it("동시에 돌아도 행을 겹쳐 만들지 않는다", async () => {
    const id = await seedSeries(userId, {
      rows: [[1, "2026-12-31", 500000]],
    });

    await Promise.all([
      extendContinuousSeries({ userId, untilMonth: "2027-06" }),
      extendContinuousSeries({ userId, untilMonth: "2027-06" }),
    ]);

    expect(await rowsOf(id)).toHaveLength(7);
  });

  it("목표 달은 2099년 12월을 넘지 않는다", async () => {
    const id = await seedSeries(userId, {
      generatedUntil: "2099-10",
      rows: [[1, "2099-10-31", 1000]],
    });

    await extendContinuousSeries({ userId, untilMonth: "2100-06" });

    expect(await generatedUntilOf(id)).toBe("2099-12-01");
    expect(await rowsOf(id)).toHaveLength(3);
  });

  it("계속 반복이 아니거나 이미 목표 달까지 만들었으면 건드리지 않는다", async () => {
    const ended = await seedSeries(userId, {
      isContinuous: false,
      rows: [[1, "2026-12-31", 1000]],
    });
    const ready = await seedSeries(userId, {
      generatedUntil: "2027-06",
      rows: [[1, "2027-06-30", 1000]],
    });

    expect(
      await extendContinuousSeries({ userId, untilMonth: "2027-06" }),
    ).toEqual({ series: 0, created: 0 });
    expect(await rowsOf(ended)).toHaveLength(1);
    expect(await rowsOf(ready)).toHaveLength(1);
  });

  it("userId를 주면 그 사용자 것만, 없으면 모든 사용자 것을 연장한다", async () => {
    const mine = await seedSeries(userId, { rows: [[1, "2026-12-31", 1000]] });
    const others = await seedSeries(otherId, {
      rows: [[1, "2026-12-31", 1000]],
    });

    await extendContinuousSeries({ userId, untilMonth: "2027-01" });
    expect(await rowsOf(others)).toHaveLength(1);

    expect(await extendContinuousSeries({ untilMonth: "2027-02" })).toEqual({
      series: 2,
      created: 3,
    });
    expect(await rowsOf(mine)).toHaveLength(3);
    expect(await rowsOf(others)).toHaveLength(3);
  });

  it("남은 행이 없는 묶음은 본뜰 행이 없어 건너뛴다", async () => {
    const id = await seedSeries(userId, { rows: [] });

    expect(
      await extendContinuousSeries({ userId, untilMonth: "2027-03" }),
    ).toEqual({ series: 0, created: 0 });
    expect(await generatedUntilOf(id)).toBe("2026-12-01");
  });
});
