import { v7 as uuidv7 } from "uuid";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { convertToDateStr } from "@/lib/date";
import { prisma } from "@/server/db";
import {
  createExpense,
  getDayExpenses,
  getExpense,
} from "@/server/expenseService";
import { deleteExpense, updateExpense } from "@/server/scopeService";

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

describe("createExpense 반복 (데이터 아키텍처 5-2)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const rowsOf = async (seriesId: string) =>
    (
      await prisma.expense.findMany({
        where: { seriesId },
        orderBy: { seq: "asc" },
      })
    ).map((row) => [row.seq, convertToDateStr(row.date), row.amount]);

  const base = {
    title: "아이패드",
    category: "APPLIANCE" as const,
    content: null,
  };

  it("할부 총액: 묶음과 회차 행을 한 번에 만들고 첫 행의 id와 날짜를 돌려준다", async () => {
    const result = await createExpense(userId, {
      ...base,
      date: "2026-10-31",
      amount: 100000,
      repeat: { type: "installment", count: 3, basis: "total" },
    });

    const first = await prisma.expense.findUniqueOrThrow({
      where: { id: result.id },
      include: { series: true },
    });
    expect(result.date).toBe("2026-10-31");
    expect(first.seq).toBe(1);
    expect(first.series).toMatchObject({
      userId,
      type: "INSTALLMENT",
      billingDay: 31,
      isContinuous: false,
      totalCount: 3,
      installmentTotal: 100000,
      generatedUntil: null,
    });
    expect(await rowsOf(first.series?.id ?? "")).toEqual([
      [1, "2026-10-31", 33334],
      [2, "2026-11-30", 33333],
      [3, "2026-12-31", 33333],
    ]);
  });

  it("정기 계속: 이번 달(서울 기준) + 24개월까지 만들어 둔다", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-30T16:00:00Z")); // 서울 12월 1일

    const result = await createExpense(userId, {
      ...base,
      title: "월세",
      date: "2026-10-25",
      amount: 500000,
      repeat: { type: "recurring", continuous: true },
    });

    const first = await prisma.expense.findUniqueOrThrow({
      where: { id: result.id },
      include: { series: true },
    });
    expect(first.series?.isContinuous).toBe(true);
    expect(
      first.series?.generatedUntil &&
        convertToDateStr(first.series.generatedUntil),
    ).toBe("2028-12-01");
    const rows = await rowsOf(first.series?.id ?? "");
    expect(rows).toHaveLength(27);
    expect(rows.at(-1)).toEqual([27, "2028-12-25", 500000]);
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

// 반복 없는 기록 1건을 만든다
const seedOne = async (owner = userId) => {
  const id = uuidv7();
  await prisma.expense.create({
    data: {
      id,
      userId: owner,
      date: new Date("2026-08-05"),
      title: "점심",
      category: "FOOD",
      amount: 8000,
      content: "참치김밥",
    },
  });
  return id;
};

// 할부 3회 묶음 (8·9·10월 20일)을 만들고 2회차 id를 돌려준다
const seedInstallment = async () => {
  const seriesId = uuidv7();
  await prisma.series.create({
    data: {
      id: seriesId,
      userId,
      type: "INSTALLMENT",
      billingDay: 20,
      totalCount: 3,
      installmentTotal: 300_000,
    },
  });
  const ids = [uuidv7(), uuidv7(), uuidv7()] as const;
  await prisma.expense.createMany({
    data: ["2026-08-20", "2026-09-20", "2026-10-20"].map((date, i) => ({
      id: ids[i] ?? "",
      userId,
      date: new Date(date),
      title: "아이패드",
      category: "APPLIANCE" as const,
      amount: 100_000,
      seriesId,
      seq: i + 1,
    })),
  });
  return ids[1];
};

describe("getExpense (데이터 아키텍처 6장 SC-08)", () => {
  it("반복 없는 기록은 기록만 돌려준다", async () => {
    const id = await seedOne();

    expect(await getExpense(userId, id)).toEqual({
      expense: {
        id,
        date: "2026-08-05",
        title: "점심",
        category: "FOOD",
        amount: 8000,
        content: "참치김밥",
      },
    });
  });

  it("반복 기록은 결제일·기간이 담긴 반복 정보를 함께 돌려준다", async () => {
    const id = await seedInstallment();

    expect((await getExpense(userId, id))?.series).toEqual({
      type: "INSTALLMENT",
      seq: 2,
      totalCount: 3,
      billingDay: 20,
      isContinuous: false,
      installmentTotal: 300_000,
      fromMonth: "2026-08",
      toMonth: "2026-10",
    });
  });

  it("없거나 다른 사용자의 기록이면 null", async () => {
    const othersId = await seedOne(otherId);

    expect(await getExpense(userId, uuidv7())).toBeNull();
    expect(await getExpense(userId, othersId)).toBeNull();
  });
});

describe("updateExpense (데이터 아키텍처 8-1 PATCH, 반복 없는 기록)", () => {
  it("보낸 필드만 바꾸고 바뀐 건수를 돌려준다", async () => {
    const id = await seedOne();

    const result = await updateExpense(userId, id, {
      title: "저녁",
      content: null,
      scope: { type: "one" },
    });

    expect(result).toEqual({ updated: 1 });
    expect(await getExpense(userId, id)).toMatchObject({
      expense: { title: "저녁", amount: 8000, content: null },
    });
  });

  it("날짜를 바꾼다", async () => {
    const id = await seedOne();

    await updateExpense(userId, id, {
      date: "2026-08-31",
      scope: { type: "one" },
    });

    expect((await getExpense(userId, id))?.expense.date).toBe("2026-08-31");
  });

  it("없거나 다른 사용자의 기록이면 null이고 바꾸지 않는다", async () => {
    const othersId = await seedOne(otherId);

    expect(
      await updateExpense(userId, othersId, {
        title: "남의 기록",
        scope: { type: "one" },
      }),
    ).toBeNull();
    expect(
      (await prisma.expense.findUniqueOrThrow({ where: { id: othersId } }))
        .title,
    ).toBe("점심");
  });
});

describe("deleteExpense (데이터 아키텍처 8-1 DELETE, 반복 없는 기록)", () => {
  it("기록을 지우고 지운 건수를 돌려준다", async () => {
    const id = await seedOne();

    expect(await deleteExpense(userId, id, { type: "one" })).toEqual({
      deleted: 1,
    });
    expect(await getExpense(userId, id)).toBeNull();
  });

  it("없거나 다른 사용자의 기록이면 null이고 지우지 않는다", async () => {
    const othersId = await seedOne(otherId);

    expect(await deleteExpense(userId, othersId, { type: "one" })).toBeNull();
    expect(
      await prisma.expense.findUnique({ where: { id: othersId } }),
    ).not.toBeNull();
  });
});

describe("조회 직전 연장 (데이터 아키텍처 5-4)", () => {
  it("하루 목록은 그 달까지 계속 반복을 먼저 연장한다", async () => {
    const seriesId = uuidv7();
    await prisma.series.create({
      data: {
        id: seriesId,
        userId,
        type: "RECURRING",
        billingDay: 5,
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
        date: new Date("2027-01-05"),
        title: "구독",
        category: "CULTURE",
        amount: 9900,
      },
    });

    const items = await getDayExpenses(userId, "2027-03-05");

    expect(items).toEqual([
      expect.objectContaining({
        title: "구독",
        series: { type: "RECURRING", seq: 3, totalCount: null },
      }),
    ]);
  });
});
