"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { isNotFound, isUnauthorized } from "@/api/apiClient";
import CategoryIcon from "@/components/category/CategoryIcon";
import Button from "@/components/elements/Button";
import ScopeFields from "@/components/expense/ScopeFields";
import AlertDialog from "@/components/overlays/AlertDialog";
import BottomSheet from "@/components/overlays/BottomSheet";
import Dialog from "@/components/overlays/Dialog";
import LoadError from "@/components/states/LoadError";
import { SkeletonArea, SkeletonLine } from "@/components/states/Skeleton";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useExpenseDetail } from "@/hooks/useExpenseDetail";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";
import {
  convertDeleteConfirmText,
  type ScopeSelected,
  useScopeSelection,
} from "@/hooks/useScopeSelection";
import { formatAmount } from "@/lib/amount";
import { formatFullDate } from "@/lib/date";
import {
  convertCategoryLabel,
  convertSeriesInfoText,
} from "@/lib/expenseDetailUtils";
import {
  BTN_TEXTS,
  DIALOG_TEXTS,
  SHEET_TITLES,
} from "@/shared/sharedConstants";
import { invalidateExpenseQueries } from "@/states/tanstackQuery/invalidateExpenseQueries";
import type { ExpenseDetail } from "@/types/expenseTypes";

interface ExpenseDetailSheetProps {
  /** 열린 기록 id (쿼리 `expense`). null이면 닫혀 있다 */
  expenseId: string | null;
  /** 시트를 닫는다 (쿼리 `expense`를 지운다) */
  onClose: () => void;
  /** [수정]: 그 기록의 수정 화면으로 */
  onEdit: (id: string) => void;
}

interface DetailBodyProps {
  detail: ExpenseDetail;
}

// 시트 내용 (와이어프레임 SC-08 ②~⑦)
const DetailBody = ({ detail }: DetailBodyProps) => {
  const { expense, series } = detail;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <CategoryIcon category={expense.category} />
        <div className="flex min-w-0 flex-col">
          <p className="text-title-md break-words text-text01">
            {expense.title}
          </p>
          <p className="text-caption text-text02">
            {convertCategoryLabel(expense.category)}
          </p>
        </div>
      </div>
      <p className="font-num text-num-xl text-text01">
        {formatAmount(expense.amount)}
      </p>
      <p className="text-body text-text02">{formatFullDate(expense.date)}</p>
      {expense.content && (
        <p className="rounded-md bg-surface p-3 text-body wrap-break-word whitespace-pre-wrap text-text01">
          {expense.content}
        </p>
      )}
      {series && (
        <div className="flex flex-col gap-1 text-body text-text02">
          {convertSeriesInfoText(series).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

// 새로고침으로 열 때 (와이어프레임 SC-08 ④)
const DetailSkeleton = () => {
  return (
    <SkeletonArea>
      <SkeletonLine width="1/2" />
      <SkeletonLine width="1/3" />
      <SkeletonLine width="1/2" />
    </SkeletonArea>
  );
};

// 지출 상세 바텀시트 (화면 명세 SC-08). 쿼리 `expense`로 열린다.
// 반복 기록의 [삭제]는 시트를 하나 더 띄우지 않고 이 시트 안에서 범위 선택(SC-09)으로 바꾼다
const ExpenseDetailSheet = ({
  expenseId,
  onClose,
  onEdit,
}: ExpenseDetailSheetProps) => {
  const client = useQueryClient();
  // 닫히는 움직임 동안에도 마지막 기록을 그린다
  const [shownId, setShownId] = useState(expenseId);
  if (expenseId !== null && expenseId !== shownId) setShownId(expenseId);
  // 지웠거나 없다고 확인한 기록. 다시 불러오지 않는다 (무효화로 404를 다시 받지 않게)
  const [goneId, setGoneId] = useState<string | null>(null);
  const active = expenseId !== null && expenseId !== goneId;

  const query = useExpenseDetail(shownId, { enabled: active });
  const remove = useDeleteExpense(shownId ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [deleteNotFound, setDeleteNotFound] = useState(false);

  const loadNotFound = active && isNotFound(query.error);
  const notFoundOpen = loadNotFound || deleteNotFound;
  const sheetOpen = active && !loadNotFound;
  const detail = query.data;

  // 범위 선택 중인지. 시트가 닫히면 상세로 돌아간다
  const [scopeMode, setScopeMode] = useState(false);
  const [wasSheetOpen, setWasSheetOpen] = useState(sheetOpen);
  if (sheetOpen !== wasSheetOpen) {
    setWasSheetOpen(sheetOpen);
    if (!sheetOpen) setScopeMode(false);
  }
  const scopeSelection = useScopeSelection({
    open: sheetOpen && scopeMode,
    id: shownId ?? "",
    originalDate: detail?.expense.date ?? "",
    date: detail?.expense.date ?? "",
  });
  // 확인 다이얼로그에서 [삭제]하면 지울 범위. 반복 없는 기록은 이번 건만
  const [pending, setPending] = useState<ScopeSelected | null>(null);

  // 다이얼로그가 쌓은 기록이 되돌려진 뒤에 시트를 닫는다. 먼저 닫으면 뒤로 가기가 다이얼로그 기록을 지운다
  const closeAfterDialog = useRef(false);
  useEffect(() => {
    if (confirmOpen || notFoundOpen || !closeAfterDialog.current) return;
    closeAfterDialog.current = false;
    runAfterLayerPops(onClose);
  }, [confirmOpen, notFoundOpen, onClose]);

  const markGone = () => {
    setGoneId(shownId);
    closeAfterDialog.current = true;
  };

  // [삭제]: 반복 기록은 범위 선택으로, 범위 선택에서는 고른 범위로 확인을 띄운다
  const requestDelete = () => {
    if (detail?.series && !scopeMode) {
      setScopeMode(true);
      return;
    }
    if (scopeMode) {
      const selected = scopeSelection.submit();
      if (!selected) return;
      setPending(selected);
    } else setPending(null);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    remove.mutate(pending?.scope ?? { type: "one" }, {
      onSuccess: () => {
        markGone();
        setConfirmOpen(false);
      },
      onError: (error) => {
        setConfirmOpen(false);
        // 401은 QueryClient가 로그인으로 보낸다
        if (isNotFound(error)) setDeleteNotFound(true);
        else setDeleteFailed(!isUnauthorized(error));
      },
    });
  };

  // 기록 없음 [확인]: 시트를 닫고 목록을 다시 불러온다
  const confirmNotFound = () => {
    markGone();
    setDeleteNotFound(false);
    invalidateExpenseQueries(client);
  };

  const renderBody = () => {
    if (detail?.series && scopeMode)
      return (
        <ScopeFields
          selection={scopeSelection}
          seriesType={detail.series.type}
        />
      );
    if (detail) return <DetailBody detail={detail} />;
    if (query.isError && !isNotFound(query.error))
      return (
        <LoadError
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      );
    return <DetailSkeleton />;
  };

  return (
    <>
      <BottomSheet
        open={sheetOpen}
        onClose={onClose}
        title={
          scopeMode ? SHEET_TITLES.scopeDelete : SHEET_TITLES.expenseDetail
        }
        titleHidden={!scopeMode}
        historyLayer={false}
        footer={
          detail &&
          (scopeMode ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="line" onClick={() => setScopeMode(false)}>
                {BTN_TEXTS.cancel}
              </Button>
              <Button
                variant="danger"
                disabled={!scopeSelection.ready}
                onClick={requestDelete}
              >
                {BTN_TEXTS.delete}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="danger" onClick={requestDelete}>
                {BTN_TEXTS.delete}
              </Button>
              <Button onClick={() => onEdit(detail.expense.id)}>
                {BTN_TEXTS.edit}
              </Button>
            </div>
          ))
        }
      >
        {renderBody()}
      </BottomSheet>
      <Dialog
        open={confirmOpen}
        title={DIALOG_TEXTS.deleteTitle}
        confirmLabel={BTN_TEXTS.delete}
        confirmVariant="danger"
        onConfirm={confirmDelete}
        cancelLabel={BTN_TEXTS.cancel}
        onCancel={() => setConfirmOpen(false)}
        loading={remove.isPending}
      >
        {pending ? convertDeleteConfirmText(pending) : DIALOG_TEXTS.deleteBody}
      </Dialog>
      <AlertDialog
        open={deleteFailed}
        title={DIALOG_TEXTS.deleteTitle}
        onClose={() => setDeleteFailed(false)}
      >
        {DIALOG_TEXTS.deleteFailed}
      </AlertDialog>
      <AlertDialog
        open={notFoundOpen}
        title={DIALOG_TEXTS.notFoundTitle}
        onClose={confirmNotFound}
      >
        {DIALOG_TEXTS.notFoundBody}
      </AlertDialog>
    </>
  );
};

export default ExpenseDetailSheet;
