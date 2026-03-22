/*
  Warnings:

  - Changed the type of `category` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('APPLIANCE', 'TRANSPORT', 'CULTURE', 'BEAUTY', 'FOOD', 'MEDICAL', 'CLOTHING', 'EDUCATION', 'ETC');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('RECURRING', 'INSTALLMENT');

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_userId_fkey";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "installmentNumber" INTEGER,
ALTER COLUMN "content" DROP NOT NULL;

-- Convert category from Korean String to Enum safely
ALTER TABLE "Expense" ALTER COLUMN "category" TYPE "Category" USING (
  CASE "category"
    WHEN '가전' THEN 'APPLIANCE'
    WHEN '교통' THEN 'TRANSPORT'
    WHEN '문화생활' THEN 'CULTURE'
    WHEN '미용' THEN 'BEAUTY'
    WHEN '식비' THEN 'FOOD'
    WHEN '의료' THEN 'MEDICAL'
    WHEN '의류' THEN 'CLOTHING'
    WHEN '교육' THEN 'EDUCATION'
    WHEN '기타' THEN 'ETC'
    ELSE 'ETC'
  END
)::"Category";

-- CreateTable
CREATE TABLE "ExpenseGroup" (
    "id" TEXT NOT NULL,
    "type" "GroupType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "category" "Category" NOT NULL,
    "amount" INTEGER NOT NULL,
    "billingDay" INTEGER NOT NULL,
    "totalCount" INTEGER,
    "isContinuous" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpenseGroup_userId_idx" ON "ExpenseGroup"("userId");

-- CreateIndex
CREATE INDEX "Expense_groupId_idx" ON "Expense"("groupId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ExpenseGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseGroup" ADD CONSTRAINT "ExpenseGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
