"use client";

import { useEffect, useId, useRef, useState } from "react";

import { isUnauthorized } from "@/api/apiClient";
import Button from "@/components/elements/Button";
import { inputBoxClass } from "@/components/elements/inputBoxStyles";
import TextArea from "@/components/elements/TextArea";
import TextInput from "@/components/elements/TextInput";
import CategoryGrid from "@/components/expense/CategoryGrid";
import DatePickerSheet from "@/components/expense/DatePickerSheet";
import TitleSuggestions from "@/components/expense/TitleSuggestions";
import PageHeader from "@/components/layout/PageHeader";
import AlertDialog from "@/components/overlays/AlertDialog";
import Dialog from "@/components/overlays/Dialog";
import { useCreateExpense } from "@/hooks/useCreateExpense";
import { useExpenseForm } from "@/hooks/useExpenseForm";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { useTitleSuggestions } from "@/hooks/useTitleSuggestions";
import { formatAmountInput } from "@/lib/amount";
import { formatFullDate } from "@/lib/date";
import { filterTitleSuggestions } from "@/lib/titleSuggestions";
import { EXPENSE_RULES } from "@/shared/expenseConstants";
import {
  BTN_TEXTS,
  DIALOG_TEXTS,
  FIELD_LABELS,
  PAGE_TITLES,
  PLACEHOLDERS,
  UNITS,
} from "@/shared/sharedConstants";
import type { TitleSuggestion } from "@/types/expenseTypes";

interface ExpenseFormProps {
  /** 날짜 기본값 (쿼리 date, 없거나 잘못됐으면 오늘) */
  initialDate: string;
  /** 서울 기준 오늘. 날짜 선택 달력의 오늘 표시 */
  today: string;
}

// 지출 등록 (화면 명세 SC-06). 반복·[계산]은 F5·F6에서 붙인다
const ExpenseForm = ({ initialDate, today }: ExpenseFormProps) => {
  const form = useExpenseForm(initialDate);
  const { values, errors } = form;
  const guard = useLeaveGuard(form.dirty);
  const createExpense = useCreateExpense();
  const titles = useTitleSuggestions();
  const [dateOpen, setDateOpen] = useState(false);
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
  };

  const suggestions = suggestOpen
    ? filterTitleSuggestions(titles.data ?? [], values.title)
    : [];
  const saving = createExpense.isPending;

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
    createExpense.mutate(result.request, {
      onSuccess: () => setSaveDone(true),
      // 401은 QueryClient가 로그인으로 보낸다
      onError: (error) => setSaveFailed(!isUnauthorized(error)),
    });
  };

  /** 저장 완료 알림 [확인]: 알림을 닫고, 그 뒤 폼을 비운다 */
  const confirmSaveDone = () => {
    setSaveDone(false);
    resetAfterDone.current = true;
  };

  // 알림이 쌓은 기록이 되돌려진 뒤에 비운다. 같이 비우면 작성 중 가로채기도 함께 닫혀 그 기록이 남는다.
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
        title={PAGE_TITLES.newExpense}
        backDisabled={saving}
        onBack={guard.requestLeave}
      />
      <div className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-6">
        <div className="flex flex-col gap-2">
          <p id={ids.dateLabel} className="text-body text-text01">
            {FIELD_LABELS.date}
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
          label={FIELD_LABELS.amount}
          value={formatAmountInput(values.amount)}
          onValueChange={form.setAmount}
          numeric
          unit={UNITS.won}
          placeholder={PLACEHOLDERS.amount}
          error={errors.amount}
          onBlur={() => form.blur("amount")}
        />
        <TextArea
          label={FIELD_LABELS.content}
          value={values.content}
          onValueChange={form.setContent}
          maxLength={EXPENSE_RULES.contentMax}
          placeholder={PLACEHOLDERS.content}
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
    </div>
  );
};

export default ExpenseForm;
