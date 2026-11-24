import EditExpenseView from "@/components/expense/EditExpenseView";
import { convertToKSTStr } from "@/lib/date";
import { editExpensePath } from "@/lib/navigation";
import { requireSessionUser } from "@/server/session";

interface EditExpensePageProps {
  params: Promise<{ id: string }>;
}

// 지출 수정 (화면 명세 SC-06 수정). 탭 바 없음 (SC-01)
const EditExpensePage = async ({ params }: EditExpensePageProps) => {
  const { id } = await params;
  await requireSessionUser(editExpensePath(id));

  return <EditExpenseView id={id} today={convertToKSTStr()} />;
};

export default EditExpensePage;
