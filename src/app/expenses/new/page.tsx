import PageHeader from "@/components/layout/PageHeader";
import { requireSessionUser } from "@/server/session";
import { PAGE_TITLES, PATHS } from "@/shared/sharedConstants";

// 임시: F2에서 SC-06 등록 화면으로 바꾼다. 탭 바 없음 (화면 명세 SC-01)
const NewExpensePage = async () => {
  await requireSessionUser(PATHS.newExpense);

  return (
    <div className="mx-auto min-h-dvh max-w-120 min-w-80">
      <PageHeader title={PAGE_TITLES.newExpense} />
    </div>
  );
};

export default NewExpensePage;
