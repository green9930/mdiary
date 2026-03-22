import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { title, content, category, amount, userId } = body;

  // userId(email)로 유저 조회, 없으면 생성
  let user = await prisma.user.findUnique({
    where: { email: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userId,
        name: userId.split("@")[0],
      },
    });
  }

  const expense = await prisma.expense.create({
    data: {
      title,
      content,
      category,
      amount,
      date: new Date(),
      userId: user.id,
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
