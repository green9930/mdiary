"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { isNotFound, isUnauthorized } from "@/api/apiClient";
import Button from "@/components/elements/Button";
import { inputBoxClass } from "@/components/elements/inputBoxStyles";
import TextArea from "@/components/elements/TextArea";
import TextInput from "@/components/elements/TextInput";
import CalculatorSheet from "@/components/expense/CalculatorSheet";
import CategoryGrid from "@/components/expense/CategoryGrid";
import DatePickerSheet from "@/components/expense/DatePickerSheet";
import RepeatFields from "@/components/expense/RepeatFields";
import TitleSuggestions from "@/components/expense/TitleSuggestions";
import PageHeader from "@/components/layout/PageHeader";
import AlertDialog from "@/components/overlays/AlertDialog";
import Dialog from "@/components/overlays/Dialog";
import { useCreateExpense } from "@/hooks/useCreateExpense";
import {
  emptyExpenseValues,
  toExpenseFormValues,
  useExpenseForm,
} from "@/hooks/useExpenseForm";
import { useGoBack } from "@/hooks/useGoBack";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { useTitleSuggestions } from "@/hooks/useTitleSuggestions";
import { useUpdateExpense } from "@/hooks/useUpdateExpense";
import { formatAmountInput } from "@/lib/amount";
import { formatFullDate } from "@/lib/date";
import { convertRepeatPreview, convertSeriesPreview } from "@/lib/seriesUtils";
import { filterTitleSuggestions } from "@/lib/titleSuggestionsUtils";
import { handleUpdateExpense } from "@/lib/updateExpense";
import { EXPENSE_RULES } from "@/shared/expenseConstants";
import {
  BTN_TEXTS,
  DIALOG_TEXTS,
  FIELD_LABELS,
  PAGE_TITLES,
  PATHS,
  PLACEHOLDERS,
  UNITS,
} from "@/shared/sharedConstants";
import type {
  ExpenseDetail,
  ExpenseFormValues,
  TitleSuggestion,
} from "@/types/expenseTypes";

interface ExpenseFormProps {
  /** 날짜 기본값 (쿼리 date, 없거나 잘못됐으면 오늘) */
  initialDate: string;
  /** 서울 기준 오늘. 날짜 선택 달력의 오늘 표시 */
  today: string;
  /** 수정할 원래 기록. 없으면 등록이다 */
  editing?: ExpenseDetail["expense"];
  /** 수정할 기록의 반복 정보. 반복 기록이면 있다 */
  series?: ExpenseDetail["series"];
}

// 반복을 고르면 날짜 라벨이 결제일로, 할부 총액이면 금액 라벨이 총액으로 바뀐다 (등록만)
const dateLabelOf = (values: ExpenseFormValues, editing: boolean) => {
  if (editing || values.repeat === "none") return FIELD_LABELS.date;
  return values.repeat === "recurring"
    ? FIELD_LABELS.dateFirstRecurring
    : FIELD_LABELS.dateFirstInstallment;
};

const amountLabelOf = (values: ExpenseFormValues, editing: boolean) =>
  !editing &&
  values.repeat === "installment" &&
  values.installmentBasis === "total"
    ? FIELD_LABELS.amountTotal
    : FIELD_LABELS.amount;

// 지출 등록·수정 (화면 명세 SC-06). 수정 화면은 반복 종류·기간을 잠근다
const ExpenseForm = ({
  initialDate,
  today,
  editing,
  series,
}: ExpenseFormProps) => {
  const router = useRouter();
  const goBack = useGoBack();
  const form = useExpenseForm(
    editing
      ? toExpenseFormValues(editing, series)
      : emptyExpenseValues(initialDate),
    { repeatLocked: !!editing },
  );
  const { values, errors } = form;
  const guard = useLeaveGuard(form.dirty);
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(editing?.id ?? "");
  // 수정 저장 때 기록이 이미 없음 (다른 기기에서 삭제)
  const [goneOnSave, setGoneOnSave] = useState(false);
  const titles = useTitleSuggestions();
  const [dateOpen, setDateOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  // 저장 완료 알림을 닫은 뒤 폼을 비울지
  const resetAfterDone = useRef(false);

  const id = useId();
  const ids = {
    dateLabel: `${id}-date-label`,
    dateValue: `${id}-date-value`,
    title: `${id}-title`,
    suggestions: `${id}-suggestions`,
    category: `${id}-category`,
    amount: `${id}-amount`,
    months: `${id}-months`,
    installmentCount: `${id}-installment-count`,
  };

  const suggestions = suggestOpen
    ? filterTitleSuggestions(titles.data ?? [], values.title)
    : [];
  const saving = createExpense.isPending || updateExpense.isPending;

  const changeTitle = (title: string) => {
    form.setTitle(title);
    setSuggestOpen(true);
  };

  const selectSuggestion = (suggestion: TitleSuggestion) => {
    form.setTitle(suggestion.title);
    if (!values.category) form.setCategory(suggestion.lastCategory);
    setSuggestOpen(false);
  };

  const save = () => {
    const result = form.submit();
    if ("error" in result) {
      const target = document.getElementById(ids[result.error]);
      target?.focus();
      target?.scrollIntoView({ block: "center" });
      return;
    }
    if (!editing) {
      createExpense.mutate(result.request, {
        onSuccess: () => setSaveDone(true),
        // 401은 QueryClient가 로그인으로 보낸다
        onError: (error) => setSaveFailed(!isUnauthorized(error)),
      });
      return;
    }
    // 수정: 바꾼 필드만 보낸다. 바꾼 것이 없으면 요청 없이 이전 화면으로
    const changes = handleUpdateExpense(editing, result.request);
    if (!changes) {
      goBack();
      return;
    }
    updateExpense.mutate(changes, {
      onSuccess: goBack,
      onError: (error) => {
        if (isNotFound(error)) setGoneOnSave(true);
        else setSaveFailed(!isUnauthorized(error));
      },
    });
  };

  // 기록 없음 [확인]: 알림이 쌓은 기록을 되돌린 뒤 달력으로 (화면 명세 SC-06 수정 저장 시 404)
  const confirmGone = () => {
    setGoneOnSave(false);
    runAfterLayerPops(() => router.replace(PATHS.calendar));
  };

  // 계산기 [적용]: 금액을 넣고, 계산식을 붙였으면 내용도 바꾼다
  const applyCalculation = (applied: { amount: number; content?: string }) => {
    form.setAmount(String(applied.amount));
    if (applied.content !== undefined) form.setContent(applied.content);
  };

  /** 저장 완료 알림 [확인]: 알림을 닫고, 그 뒤 폼을 비운다 */
  const confirmSaveDone = () => {
    setSaveDone(false);
    resetAfterDone.current = true;
  };

  // 알림이 쌓은 기록이 되돌려진 뒤에 비운다.
  // 알림이 닫히며 [저장]으로 돌려준 포커스는 그 뒤 제목 칸으로 옮겨 다음 기록을 바로 입력하게 한다
  useEffect(() => {
    if (saveDone || !resetAfterDone.current) return;
    resetAfterDone.current = false;
    runAfterLayerPops(() => {
      form.reset();
      document.getElementById(ids.title)?.focus();
    });
  }, [saveDone, form, ids.title]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-120 min-w-80 flex-col">
      <PageHeader
        title={editing ? PAGE_TITLES.editExpense : PAGE_TITLES.newExpense}
        backDisabled={saving}
        onBack={guard.requestLeave}
      />
      <div className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-6">
        <div className="flex flex-col gap-2">
          <p id={ids.dateLabel} className="text-body text-text01">
            {dateLabelOf(values, !!editing)}
          </p>
          <button
            type="button"
            aria-labelledby={`${ids.dateLabel} ${ids.dateValue}`}
            onClick={() => setDateOpen(true)}
            className={`h-12 items-center text-left ${inputBoxClass({ invalid: false, disabled: false })}`}
          >
            <span id={ids.dateValue}>{formatFullDate(values.date)}</span>
          </button>
        </div>
        <div className="relative">
          <TextInput
            id={ids.title}
            label={FIELD_LABELS.title}
            value={values.title}
            onValueChange={changeTitle}
            maxLength={EXPENSE_RULES.titleMax}
            placeholder={PLACEHOLDERS.title}
            error={errors.title}
            onBlur={() => {
              setSuggestOpen(false);
              form.blur("title");
            }}
          />
          {suggestions.length > 0 && (
            <TitleSuggestions
              id={ids.suggestions}
              suggestions={suggestions}
              onSelect={selectSuggestion}
            />
          )}
        </div>
        <CategoryGrid
          id={ids.category}
          value={values.category}
          onChange={form.setCategory}
          error={errors.category}
        />
        <TextInput
          id={ids.amount}
          label={amountLabelOf(values, !!editing)}
          value={formatAmountInput(values.amount)}
          onValueChange={form.setAmount}
          numeric
          unit={UNITS.won}
          placeholder={PLACEHOLDERS.amount}
          error={errors.amount}
          onBlur={() => form.blur("amount")}
          action={
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCalculatorOpen(true)}
            >
              {BTN_TEXTS.calculate}
            </Button>
          }
        />
        <TextArea
          label={FIELD_LABELS.content}
          value={values.content}
          onValueChange={form.setContent}
          maxLength={EXPENSE_RULES.contentMax}
          placeholder={PLACEHOLDERS.content}
        />
        <RepeatFields
          values={values}
          errors={errors}
          ids={ids}
          locked={!!editing}
          preview={
            series
              ? convertSeriesPreview(series)
              : editing
                ? []
                : convertRepeatPreview(values)
          }
          onRepeatChange={form.setRepeat}
          onPeriodChange={form.setRecurringPeriod}
          onMonthsChange={form.setMonths}
          onBasisChange={form.setInstallmentBasis}
          onCountChange={form.setInstallmentCount}
          onMonthsBlur={() => form.blur("months")}
          onCountBlur={() => form.blur("installmentCount")}
        />
      </div>
      {/* 하단 고정 [저장]: 늘 활성, 요청 중만 막는다 */}
      <div className="sticky bottom-0 bg-bg px-4 pt-3 pb-safe">
        <div className="pb-4">
          <Button size="lg" loading={saving} onClick={save}>
            {BTN_TEXTS.save}
          </Button>
        </div>
      </div>

      <DatePickerSheet
        open={dateOpen}
        value={values.date}
        today={today}
        onSelect={form.setDate}
        onClose={() => setDateOpen(false)}
      />
      <CalculatorSheet
        open={calculatorOpen}
        amount={values.amount}
        content={values.content}
        onApply={applyCalculation}
        onClose={() => setCalculatorOpen(false)}
      />
      <Dialog
        open={guard.confirmOpen}
        title={DIALOG_TEXTS.leaveTitle}
        confirmLabel={BTN_TEXTS.keepWriting}
        onConfirm={guard.keepWriting}
        cancelLabel={BTN_TEXTS.leave}
        cancelVariant="gray"
        onCancel={guard.leave}
      >
        {DIALOG_TEXTS.leaveBody}
      </Dialog>
      <AlertDialog
        open={saveFailed}
        title={DIALOG_TEXTS.saveTitle}
        onClose={() => setSaveFailed(false)}
      >
        {DIALOG_TEXTS.saveFailed}
      </AlertDialog>
      <AlertDialog
        open={saveDone}
        title={DIALOG_TEXTS.saveDoneTitle}
        onClose={confirmSaveDone}
      >
        {DIALOG_TEXTS.saveDoneBody}
      </AlertDialog>
      <AlertDialog
        open={goneOnSave}
        title={DIALOG_TEXTS.notFoundTitle}
        onClose={confirmGone}
      >
        {DIALOG_TEXTS.notFoundBody}
      </AlertDialog>
    </div>
  );
};

export default ExpenseForm;
