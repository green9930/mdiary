// 개발용 데이터. 와이어프레임 SC-03① 10월 달력을 기준으로 맞춘다.
// 주인은 테스트 사용자(test@mdiary.local)이고, E2E 테스트 로그인(P3)과 같은 사용자다.
// 다시 돌리면 테스트 사용자의 데이터를 지우고 새로 넣는다.
import { PrismaPg } from "@prisma/adapter-pg";
import { v7 as uuidv7 } from "uuid";

import { type Category, PrismaClient } from "../src/generated/prisma/client";
import { TEST_USER } from "../src/server/tests/testUserConstants";
import { cliDatabaseUrl } from "./db-url";

type Item = [
  date: string,
  title: string,
  category: Category,
  amount: number,
  content?: string,
];

// 2026년 10월: 합계 1,234,500원, 42건 (SC-03①, SC-04①)
const OCTOBER: Item[] = [
  ["2026-10-01", "점심", "FOOD", 8_000],
  ["2026-10-03", "장보기", "FOOD", 45_000, "쿠팡 프레시 주문"],
  ["2026-10-05", "커피", "FOOD", 4_500],
  ["2026-10-05", "점심", "FOOD", 7_800],
  ["2026-10-07", "버스", "TRANSPORT", 1_450],
  ["2026-10-07", "지하철", "TRANSPORT", 1_550],
  ["2026-10-10", "마트 장보기", "FOOD", 94_400],
  ["2026-10-10", "아침", "FOOD", 3_500],
  ["2026-10-10", "점심", "FOOD", 9_000],
  ["2026-10-10", "커피", "FOOD", 4_800],
  ["2026-10-10", "간식", "FOOD", 3_200],
  ["2026-10-10", "저녁 배달", "FOOD", 27_000],
  ["2026-10-10", "과일", "FOOD", 15_000],
  ["2026-10-10", "빵", "FOOD", 6_500],
  ["2026-10-10", "커피", "FOOD", 5_000],
  ["2026-10-10", "편의점", "FOOD", 4_700],
  ["2026-10-10", "점심", "FOOD", 11_000],
  ["2026-10-10", "디저트", "FOOD", 6_800],
  ["2026-10-10", "반찬가게", "FOOD", 7_500],
  ["2026-10-10", "커피", "FOOD", 4_500],
  ["2026-10-10", "야식", "FOOD", 1_500],
  ["2026-10-10", "음료", "FOOD", 4_000],
  ["2026-10-10", "KTX 왕복", "TRANSPORT", 118_000],
  ["2026-10-10", "택시", "TRANSPORT", 18_600],
  ["2026-10-10", "택시", "TRANSPORT", 13_500],
  ["2026-10-10", "관리비", "LIVING", 236_400],
  ["2026-10-10", "수도요금", "LIVING", 50_000],
  ["2026-10-10", "쿠팡 생필품", "LIVING", 32_400],
  ["2026-10-10", "인터넷 요금", "LIVING", 33_000],
  ["2026-10-10", "가스비", "LIVING", 54_600],
  ["2026-10-10", "전기요금", "LIVING", 100_000],
  ["2026-10-10", "에어팟", "APPLIANCE", 149_000],
  ["2026-10-10", "충전 케이블", "APPLIANCE", 10_000],
  ["2026-10-10", "미용실", "BEAUTY", 30_000],
  ["2026-10-10", "네일", "BEAUTY", 5_000],
  ["2026-10-10", "영화", "CULTURE", 15_000],
  ["2026-10-10", "책", "EDUCATION", 6_100],
  ["2026-10-13", "빵", "FOOD", 9_000],
  ["2026-10-13", "약국", "MEDICAL", 900],
  ["2026-10-18", "점심 김밥", "FOOD", 8_000, "참치김밥 2줄\n회사 앞 분식집"],
  // 10-18 넷플릭스 13,300원은 아래 정기 묶음의 첫 행
  ["2026-10-31", "저녁 회식", "FOOD", 55_000],
];

// 2026년 8월: 합계 812,000원 (SC-03②)
const AUGUST: Item[] = [
  ["2026-08-01", "커피", "FOOD", 4_500],
  ["2026-08-04", "교통카드 충전", "TRANSPORT", 31_000],
  ["2026-08-07", "점심", "FOOD", 12_000],
  ["2026-08-10", "여름휴가 숙소", "CULTURE", 250_000],
  ["2026-08-14", "점심", "FOOD", 8_800],
  ["2026-08-17", "여름 옷", "CLOTHING", 56_000],
  ["2026-08-21", "치과", "MEDICAL", 120_000],
  ["2026-08-25", "영어 학원", "EDUCATION", 300_000],
  ["2026-08-28", "미용실", "BEAUTY", 29_700],
];

const NETFLIX = { title: "넷플릭스 스탠다드 요금제 월 구독료", amount: 13_300 };

// 와이어프레임의 숫자 (SC-03①·②, SC-04①)
const EXPECTED = {
  october: { total: 1_234_500, count: 42 },
  august: { total: 812_000 },
  octoberByCategory: {
    LIVING: 519_700,
    FOOD: 345_700,
    TRANSPORT: 153_100,
    MEDICAL: 900,
  },
  octoberFoodCount: 23,
};

/** 'YYYY-MM-DD'를 그 달 기준으로 n개월 옮기고 결제일을 맞춘다 (없는 날은 말일). */
const monthDate = (start: string, n: number, billingDay: number): string => {
  const [y, m] = start.split("-").map(Number) as [number, number];
  const first = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  first.setUTCDate(Math.min(billingDay, last));
  return first.toISOString().slice(0, 10);
};

/** 데이터 아키텍처 5-2 연장 끝 달: max(시작 달, 이번 달 + 24개월)의 1일 (Asia/Seoul). */
const extendUntil = (start: string): string => {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });
  const target = monthDate(today, 24, 1);
  const startMonth = `${start.slice(0, 7)}-01`;
  return target > startMonth ? target : startMonth;
};

const check = (label: string, actual: number, expected: number) => {
  if (actual !== expected)
    throw new Error(
      `seed 값이 와이어프레임과 다릅니다: ${label} ${actual} ≠ ${expected}`,
    );
};

const sum = (items: Item[]) =>
  items.reduce((total, item) => total + item[3], 0);

const main = async () => {
  const food = OCTOBER.filter((item) => item[2] === "FOOD");

  const october = [
    ...OCTOBER,
    ["2026-10-18", NETFLIX.title, "LIVING", NETFLIX.amount] as Item,
  ];
  check("10월 합계", sum(october), EXPECTED.october.total);
  check("10월 건수", october.length, EXPECTED.october.count);
  check("10월 식비 건수", food.length, EXPECTED.octoberFoodCount);
  for (const [category, total] of Object.entries(EXPECTED.octoberByCategory)) {
    check(
      `10월 ${category}`,
      sum(october.filter((item) => item[2] === category)),
      total,
    );
  }
  check("8월 합계", sum(AUGUST), EXPECTED.august.total);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: cliDatabaseUrl()! }),
  });
  const userId = TEST_USER.id;
  const row = ([date, title, category, amount, content]: Item) => ({
    id: uuidv7(),
    userId,
    date: new Date(date),
    title,
    category,
    amount,
    content: content ?? null,
  });

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({ where: { id: userId } });
    await tx.user.create({ data: { ...TEST_USER, emailVerified: true } });
    await tx.expense.createMany({ data: [...AUGUST, ...OCTOBER].map(row) });

    // 넷플릭스: 정기 · 매달 18일 · 계속 (10월부터)
    const netflixUntil = extendUntil("2026-10-18");
    const netflix = await tx.series.create({
      data: {
        id: uuidv7(),
        userId,
        type: "RECURRING",
        billingDay: 18,
        isContinuous: true,
        generatedUntil: new Date(netflixUntil),
      },
    });
    // 월세: 정기 · 매달 25일 · 계속 (11월부터, 10월 달력과 겹치지 않게)
    const rentUntil = extendUntil("2026-11-25");
    const rent = await tx.series.create({
      data: {
        id: uuidv7(),
        userId,
        type: "RECURRING",
        billingDay: 25,
        isContinuous: true,
        generatedUntil: new Date(rentUntil),
      },
    });
    // 아이패드: 할부 3회 · 회차당 100,000원 (11월부터)
    const ipad = await tx.series.create({
      data: {
        id: uuidv7(),
        userId,
        type: "INSTALLMENT",
        billingDay: 1,
        totalCount: 3,
        installmentTotal: 300_000,
      },
    });

    const seriesRows = [];
    for (
      let n = 0;
      monthDate("2026-10-18", n, 18).slice(0, 7) <= netflixUntil.slice(0, 7);
      n++
    ) {
      seriesRows.push({
        ...row([
          monthDate("2026-10-18", n, 18),
          NETFLIX.title,
          "LIVING",
          NETFLIX.amount,
        ]),
        seriesId: netflix.id,
        seq: n + 1,
      });
    }
    for (
      let n = 0;
      monthDate("2026-11-25", n, 25).slice(0, 7) <= rentUntil.slice(0, 7);
      n++
    ) {
      seriesRows.push({
        ...row([monthDate("2026-11-25", n, 25), "월세", "LIVING", 500_000]),
        seriesId: rent.id,
        seq: n + 1,
      });
    }
    for (let n = 0; n < 3; n++) {
      seriesRows.push({
        ...row([
          monthDate("2026-11-01", n, 1),
          "아이패드",
          "APPLIANCE",
          100_000,
        ]),
        seriesId: ipad.id,
        seq: n + 1,
      });
    }
    await tx.expense.createMany({ data: seriesRows });
  });

  const count = await prisma.expense.count({ where: { userId } });
  console.log(`seed: ${TEST_USER.email} 지출 ${count}건`);
  await prisma.$disconnect();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
