import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "테스트유저",
    },
  });

  // 일반 지출
  const expenses = await prisma.expense.createMany({
    data: [
      { title: "점심식사", content: "회사 근처 식당", category: "FOOD", date: new Date("2026-03-01"), amount: 9000, userId: user.id },
      { title: "교통비", content: "출퇴근 지하철", category: "TRANSPORT", date: new Date("2026-03-02"), amount: 2800, userId: user.id },
      { title: "커피", category: "FOOD", date: new Date("2026-03-02"), amount: 4500, userId: user.id },
      { title: "영화 관람", content: "주말 영화", category: "CULTURE", date: new Date("2026-03-08"), amount: 15000, userId: user.id },
      { title: "미용실", category: "BEAUTY", date: new Date("2026-03-10"), amount: 20000, userId: user.id },
    ],
  });

  // 정기 지출 (구독)
  const recurringGroup = await prisma.expenseGroup.create({
    data: {
      type: "RECURRING",
      title: "넷플릭스",
      category: "CULTURE",
      amount: 17000,
      billingDay: 15,
      isContinuous: true,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2036-01-15"),
      userId: user.id,
      expenses: {
        create: Array.from({ length: 12 }, (_, i) => ({
          title: "넷플릭스",
          category: "CULTURE" as const,
          date: new Date(2026, i, 15),
          amount: 17000,
          userId: user.id,
        })),
      },
    },
    include: { expenses: true },
  });

  // 할부
  const installmentGroup = await prisma.expenseGroup.create({
    data: {
      type: "INSTALLMENT",
      title: "노트북 할부",
      content: "맥북 프로 16인치",
      category: "APPLIANCE",
      amount: 200000,
      billingDay: 10,
      totalCount: 12,
      isContinuous: false,
      startDate: new Date("2026-03-10"),
      endDate: new Date("2027-02-10"),
      userId: user.id,
      expenses: {
        create: Array.from({ length: 12 }, (_, i) => ({
          title: "노트북 할부",
          content: "맥북 프로 16인치",
          category: "APPLIANCE" as const,
          date: new Date(2026, 2 + i, 10),
          amount: 200000,
          installmentNumber: i + 1,
          userId: user.id,
        })),
      },
    },
    include: { expenses: true },
  });

  console.log(`User: ${user.name} (${user.email})`);
  console.log(`일반 지출: ${expenses.count}건`);
  console.log(`정기 지출 (${recurringGroup.title}): ${recurringGroup.expenses.length}건`);
  console.log(`할부 (${installmentGroup.title}): ${installmentGroup.expenses.length}건`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
