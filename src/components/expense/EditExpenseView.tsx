"use client";

import { useRouter } from "next/navigation";

import { isNotFound } from "@/api/apiClient";
import ExpenseForm from "@/components/expense/ExpenseForm";
import PageHeader from "@/components/layout/PageHeader";
import AlertDialog from "@/components/overlays/AlertDialog";
import LoadError from "@/components/states/LoadError";
import { SkeletonArea, SkeletonLine } from "@/components/states/Skeleton";
import { useExpenseDetail } from "@/hooks/useExpenseDetail";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";
import { DIALOG_TEXTS, PAGE_TITLES, PATHS } from "@/shared/sharedConstants";

interface EditExpenseViewProps {
  id: string;
  /** 서울 기준 오늘 */
  today: string;
}

// 수정 화면 (화면 명세 SC-06 수정): 기록을 불러와 원래 값을 채운 폼을 연다. 없으면(404) 알림 뒤 달력으로
const EditExpenseView = ({ id, today }: EditExpenseViewProps) => {
  const router = useRouter();
  const query = useExpenseDetail(id);

  if (query.data)
    return (
      <ExpenseForm
        initialDate={query.data.expense.date}
        today={today}
        editing={query.data.expense}
      />
    );

  const notFound = isNotFound(query.error);
  return (
    <div className="mx-auto flex min-h-dvh max-w-120 min-w-80 flex-col">
      <PageHeader title={PAGE_TITLES.editExpense} />
      <div className="flex flex-col gap-6 px-4 pt-2 pb-6">
        {query.isError && !notFound ? (
          <LoadError
            onRetry={() => void query.refetch()}
            retrying={query.isFetching}
          />
        ) : (
          <SkeletonArea>
            <SkeletonLine width="1/3" />
            <SkeletonLine width="full" />
            <SkeletonLine width="1/3" />
            <SkeletonLine width="full" />
          </SkeletonArea>
        )}
      </div>
      <AlertDialog
        open={notFound}
        title={DIALOG_TEXTS.notFoundTitle}
        onClose={() => runAfterLayerPops(() => router.replace(PATHS.calendar))}
      >
        {DIALOG_TEXTS.notFoundBody}
      </AlertDialog>
    </div>
  );
};

export default EditExpenseView;
