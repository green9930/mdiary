import { v7 as uuidv7 } from "uuid";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { convertToDateStr, convertToDbDate } from "@/lib/date";
import { prisma } from "@/server/db";
import {
  deleteExpense,
  getScopePreview,
  updateExpense,
} from "@/server/scopeService";

const userId = "scope-service-user";
const otherId = "scope-service-other";

beforeAll(async () => {
  await prisma.user.createMany({
    data: [
      { id: userId, name: "테스트", email: "scope-service@mdiary.local" },
      { id: otherId, name: "다른", email: "scope-service-o@mdiary.local" },
    ],
  });
});

beforeEach(async () => {
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.series.deleteMany({ where: { userId } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await prisma.$disconnect();
});

interface SeedOptions {
  type?: "RECURRING" | "INSTALLMENT";
  billingDay?: number;
  isContinuous?: boolean;
  /** 계속 반복이 만들어 둔 마지막 달 (YYYY-MM) */
  generatedUntil?: string;
  /** [seq, 날짜]. 금액은 10000 */
  rows: [number, string][];
}

/** 묶음과 행을 만들고 묶음 id와 seq별 행 id를 돌려준다 */
const seedSeries = async ({
  type = "RECURRING",
  billingDay = 25,
  isContinuous = false,
  generatedUntil,
  rows,
}: SeedOptions) => {
  const seriesId = uuidv7();
  await prisma.series.create({
    data: {
      id: seriesId,
      userId,
      type,
      billingDay,
      isContinuous,
      totalCount: isContinuous ? null : rows.length,
      installmentTotal: type === "INSTALLMENT" ? rows.length * 10000 : null,
      generatedUntil: generatedUntil
        ? convertToDbDate(`${generatedUntil}-01`)
        : null,
    },
  });
  const ids = new Map<number, string>();
  for (const [seq, date] of rows) {
    const id = uuidv7();
    ids.set(seq, id);
    await prisma.expense.create({
      data: {
        id,
        userId,
        seriesId,
        seq,
        date: convertToDbDate(date),
        title: "월세",
        category: "LIVING",
        amount: 10000,
      },
    });
  }
  const idOf = (seq: number) => {
    const id = ids.get(seq);
    if (!id) throw new Error(`seq ${seq} 없음`);
    return id;
  };
  return { seriesId, idOf };
};

const rowsOf = async (seriesId: string) =>
  (
    await prisma.expense.findMany({
      where: { seriesId },
      orderBy: { seq: "asc" },
    })
  ).map((row) => [row.seq, convertToDateStr(row.date), row.title, row.amount]);

const seriesOf = (id: string) => prisma.series.findUnique({ where: { id } });

// 미리보기의 영향 범위만 (거절·없음이면 undefined)
const affectedOf = async (preview: ReturnType<typeof getScopePreview>) => {
  const result = await preview;
  return result && "affected" in result ? result.affected : undefined;
};

// 2026년 10월 ~ 2027년 3월, 매달 25일 6건
const sixMonths: [number, string][] = [
  [1, "2026-10-25"],
  [2, "2026-11-25"],
  [3, "2026-12-25"],
  [4, "2027-01-25"],
  [5, "2027-02-25"],
  [6, "2027-03-25"],
];

describe("updateExpense 범위 (데이터 아키텍처 5-3)", () => {
  it("이번 건만: 그 행만 바꾸고, 날짜는 어느 달로든 옮긴다", async () => {
    const { seriesId, idOf } = await seedSeries({ rows: sixMonths });

    expect(
      await updateExpense(userId, idOf(3), {
        title: "관리비",
        date: "2026-11-03",
        scope: { type: "one" },
      }),
    ).toEqual({ updated: 1 });

    const rows = await rowsOf(seriesId);
    expect(rows[2]).toEqual([3, "2026-11-03", "관리비", 10000]);
    expect(rows.filter(([, , title]) => title === "관리비")).toHaveLength(1);
    expect((await seriesOf(seriesId))?.billingDay).toBe(25);
  });

  it("이후 전체: 이 건과 뒤 건만 바꾸고 앞 건은 두며, 할부 총액은 그대로다", async () => {
    const { seriesId, idOf } = await seedSeries({
      type: "INSTALLMENT",
      rows: sixMonths,
    });

    expect(
      await updateExpense(userId, idOf(4), {
        amount: 12000,
        scope: { type: "after" },
      }),
    ).toEqual({ updated: 3 });

    expect((await rowsOf(seriesId)).map(([, , , amount]) => amount)).toEqual([
      10000, 10000, 10000, 12000, 12000, 12000,
    ]);
    expect((await seriesOf(seriesId))?.installmentTotal).toBe(60000);
  });

  it("이후 전체 + 같은 달 날짜: 각 건의 일을 새 일로(말일 맞추기), 결제일을 바꾼다", async () => {
    const { seriesId, idOf } = await seedSeries({ rows: sixMonths });

    await updateExpense(userId, idOf(4), {
      date: "2027-01-31",
      scope: { type: "after" },
    });

    expect((await rowsOf(seriesId)).map(([, date]) => date)).toEqual([
      "2026-10-25",
      "2026-11-25",
      "2026-12-25",
      "2027-01-31",
      "2027-02-28",
      "2027-03-31",
    ]);
    expect((await seriesOf(seriesId))?.billingDay).toBe(31);
  });

  it("이후 전체 + 뒤 달: Δ개월 밀고 일을 바꾼다. 계속 반복은 generatedUntil도 민다 (D11)", async () => {
    const { seriesId, idOf } = await seedSeries({
      isContinuous: true,
      generatedUntil: "2027-01",
      rows: [
        [1, "2026-11-25"],
        [2, "2026-12-25"],
        [3, "2027-01-25"],
      ],
    });

    expect(
      await updateExpense(userId, idOf(2), {
        date: "2027-01-03",
        scope: { type: "after" },
      }),
    ).toEqual({ updated: 2 });

    expect((await rowsOf(seriesId)).map(([, date]) => date)).toEqual([
      "2026-11-25",
      "2027-01-03",
      "2027-02-03",
    ]);
    const series = await seriesOf(seriesId);
    expect(series?.billingDay).toBe(3);
    expect(
      series?.generatedUntil && convertToDateStr(series.generatedUntil),
    ).toBe("2027-02-01");
  });

  it("이 건부터 N개월: 지운 달을 건너 앞에서 N건, 결제일은 그대로", async () => {
    const { seriesId, idOf } = await seedSeries({
      rows: sixMonths.filter(([seq]) => seq !== 3),
    });

    expect(
      await updateExpense(userId, idOf(2), {
        title: "관리비",
        date: "2026-11-10",
        scope: { type: "count", n: 3 },
      }),
    ).toEqual({ updated: 3 });

    expect(
      (await rowsOf(seriesId)).map(([seq, date, title]) => [seq, date, title]),
    ).toEqual([
      [1, "2026-10-25", "월세"],
      [2, "2026-11-10", "관리비"],
      [4, "2027-01-10", "관리비"],
      [5, "2027-02-10", "관리비"],
      [6, "2027-03-25", "월세"],
    ]);
    expect((await seriesOf(seriesId))?.billingDay).toBe(25);
  });

  it("계속 반복의 N이 만들어 둔 행보다 많으면 먼저 연장한다", async () => {
    const { seriesId, idOf } = await seedSeries({
      isContinuous: true,
      generatedUntil: "2026-11",
      rows: [
        [1, "2026-10-25"],
        [2, "2026-11-25"],
      ],
    });

    expect(
      await updateExpense(userId, idOf(2), {
        amount: 20000,
        scope: { type: "count", n: 3 },
      }),
    ).toEqual({ updated: 3 });

    expect(
      (await rowsOf(seriesId)).map(([seq, date, , amount]) => [
        seq,
        date,
        amount,
      ]),
    ).toEqual([
      [1, "2026-10-25", 10000],
      [2, "2026-11-25", 20000],
      [3, "2026-12-25", 20000],
      [4, "2027-01-25", 20000],
    ]);
  });

  it("고를 수 없는 범위는 바꾸지 않고 SCOPE_NOT_ALLOWED", async () => {
    const { seriesId, idOf } = await seedSeries({ rows: sixMonths });
    const refused = { error: "SCOPE_NOT_ALLOWED" };

    // 앞 달로 이후 전체, 뒤 달로 N개월, 남은 건수보다 큰 N
    expect(
      await updateExpense(userId, idOf(3), {
        date: "2026-11-25",
        scope: { type: "after" },
      }),
    ).toEqual(refused);
    expect(
      await updateExpense(userId, idOf(3), {
        date: "2027-01-25",
        scope: { type: "count", n: 2 },
      }),
    ).toEqual(refused);
    expect(
      await updateExpense(userId, idOf(3), {
        title: "관리비",
        scope: { type: "count", n: 5 },
      }),
    ).toEqual(refused);
    expect(
      (await rowsOf(seriesId)).every(
        ([, date, title], i) => title === "월세" && date === sixMonths[i]?.[1],
      ),
    ).toBe(true);
  });

  it("반복 없는 기록은 이번 건만 받는다", async () => {
    const id = uuidv7();
    await prisma.expense.create({
      data: {
        id,
        userId,
        date: convertToDbDate("2026-10-18"),
        title: "점심",
        category: "FOOD",
        amount: 8000,
      },
    });

    expect(
      await updateExpense(userId, id, {
        title: "저녁",
        scope: { type: "after" },
      }),
    ).toEqual({ error: "SCOPE_NOT_ALLOWED" });
    expect(
      await updateExpense(userId, id, {
        title: "저녁",
        scope: { type: "one" },
      }),
    ).toEqual({ updated: 1 });
  });

  it("없거나 남의 기록이면 null", async () => {
    const { idOf } = await seedSeries({ rows: sixMonths });
    expect(
      await updateExpense(otherId, idOf(1), {
        title: "x",
        scope: { type: "one" },
      }),
    ).toBeNull();
    expect(
      await updateExpense(userId, uuidv7(), {
        title: "x",
        scope: { type: "one" },
      }),
    ).toBeNull();
  });
});

describe("deleteExpense 범위 (데이터 아키텍처 5-5)", () => {
  it("이번 건만: 마지막 행이면 묶음도 지운다", async () => {
    const { seriesId, idOf } = await seedSeries({
      rows: [[1, "2026-10-25"]],
    });

    expect(await deleteExpense(userId, idOf(1), { type: "one" })).toEqual({
      deleted: 1,
    });
    expect(await seriesOf(seriesId)).toBeNull();
  });

  it("이후 전체: 이 건과 뒤 건을 지우고 앞 건은 둔다", async () => {
    const { seriesId, idOf } = await seedSeries({ rows: sixMonths });

    expect(await deleteExpense(userId, idOf(5), { type: "after" })).toEqual({
      deleted: 2,
    });
    expect((await rowsOf(seriesId)).map(([seq]) => seq)).toEqual([1, 2, 3, 4]);
  });

  it("계속 반복의 이후 전체는 반복을 끝낸다", async () => {
    const { seriesId, idOf } = await seedSeries({
      isContinuous: true,
      generatedUntil: "2026-12",
      rows: [
        [1, "2026-10-25"],
        [2, "2026-11-25"],
        [3, "2026-12-25"],
      ],
    });

    await deleteExpense(userId, idOf(2), { type: "after" });

    expect((await seriesOf(seriesId))?.isContinuous).toBe(false);
    expect((await rowsOf(seriesId)).map(([seq]) => seq)).toEqual([1]);
  });

  it("이 건부터 N개월: 앞에서 N건만 지우고 계속 반복은 그대로 계속", async () => {
    const { seriesId, idOf } = await seedSeries({
      isContinuous: true,
      generatedUntil: "2026-12",
      rows: [
        [1, "2026-10-25"],
        [2, "2026-11-25"],
        [3, "2026-12-25"],
      ],
    });

    expect(
      await deleteExpense(userId, idOf(1), { type: "count", n: 2 }),
    ).toEqual({ deleted: 2 });
    expect((await rowsOf(seriesId)).map(([seq]) => seq)).toEqual([3]);
    expect((await seriesOf(seriesId))?.isContinuous).toBe(true);
  });

  it("반복 없는 기록은 이번 건만, 남의 기록은 null", async () => {
    const { idOf } = await seedSeries({ rows: sixMonths });
    expect(await deleteExpense(otherId, idOf(1), { type: "one" })).toBeNull();
  });
});

describe("getScopePreview (데이터 아키텍처 5-6)", () => {
  it("이번 건만: 1건과 그 건(바꾼 날짜)의 달, 남은 건수", async () => {
    const { idOf } = await seedSeries({ rows: sixMonths });

    expect(
      await getScopePreview(userId, idOf(3), { type: "one" }, "2026-11-03"),
    ).toEqual({
      remaining: 4,
      affected: {
        count: 1,
        fromMonth: "2026-11",
        toMonth: "2026-11",
        continuous: false,
      },
    });
  });

  it("이후 전체: 이 건의 달 ~ 마지막 건의 달, 뒤 달로 바꾸면 민 달", async () => {
    const { idOf } = await seedSeries({ rows: sixMonths });

    expect(
      await affectedOf(getScopePreview(userId, idOf(3), { type: "after" })),
    ).toEqual({
      count: 4,
      fromMonth: "2026-12",
      toMonth: "2027-03",
      continuous: false,
    });
    expect(
      await affectedOf(
        getScopePreview(userId, idOf(3), { type: "after" }, "2027-01-03"),
      ),
    ).toEqual({
      count: 4,
      fromMonth: "2027-01",
      toMonth: "2027-04",
      continuous: false,
    });
  });

  it("계속 반복: 남은 건수는 null, 이후 전체는 그 달부터 계속", async () => {
    const { idOf } = await seedSeries({
      isContinuous: true,
      generatedUntil: "2026-12",
      rows: [
        [1, "2026-10-25"],
        [2, "2026-11-25"],
        [3, "2026-12-25"],
      ],
    });

    expect(await getScopePreview(userId, idOf(2), { type: "after" })).toEqual({
      remaining: null,
      affected: {
        count: null,
        fromMonth: "2026-11",
        toMonth: null,
        continuous: true,
      },
    });
  });

  it("이 건부터 N개월: N번째 건의 달까지 (지운 달은 건너뜀)", async () => {
    const { idOf } = await seedSeries({
      rows: sixMonths.filter(([seq]) => seq !== 3),
    });

    expect(
      await affectedOf(
        getScopePreview(userId, idOf(2), { type: "count", n: 3 }),
      ),
    ).toEqual({
      count: 3,
      fromMonth: "2026-11",
      toMonth: "2027-02",
      continuous: false,
    });
  });

  it("고를 수 없으면 SCOPE_NOT_ALLOWED, 없으면 null", async () => {
    const { idOf } = await seedSeries({ rows: sixMonths });
    const refused = { error: "SCOPE_NOT_ALLOWED" };

    expect(
      await getScopePreview(userId, idOf(3), { type: "count", n: 5 }),
    ).toEqual(refused);
    expect(
      await getScopePreview(userId, idOf(3), { type: "after" }, "2026-11-25"),
    ).toEqual(refused);
    expect(await getScopePreview(otherId, idOf(3), { type: "one" })).toBeNull();
  });
});
