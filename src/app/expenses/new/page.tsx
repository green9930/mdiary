import ExpenseForm from "@/components/expense/ExpenseForm";
import { convertToKSTStr, dateOrToday } from "@/lib/date";
import { requireSessionUser } from "@/server/session";
import { PATHS } from "@/shared/sharedConstants";

interface NewExpensePageProps {
  searchParams: Promise<{ date?: string }>;
}

// 지출 등록 (화면 명세 SC-06). 탭 바 없음 (SC-01)
const NewExpensePage = async ({ searchParams }: NewExpensePageProps) => {
  const { date } = await searchParams;
  await requireSessionUser(
    date
      ? `${PATHS.newExpense}?${new URLSearchParams({ date })}`
      : PATHS.newExpense,
  );
  const today = convertToKSTStr();

  return <ExpenseForm initialDate={dateOrToday(date, today)} today={today} />;
};

export default NewExpensePage;
