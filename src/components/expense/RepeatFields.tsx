import NumberInput from "@/components/elements/NumberInput";
import Segment from "@/components/elements/Segment";
import { SERIES_RULES } from "@/shared/expenseConstants";
import {
  ARIA_LABELS,
  FIELD_HINTS,
  FIELD_LABELS,
  PLACEHOLDERS,
  REPEAT_TEXTS,
} from "@/shared/sharedConstants";
import type {
  ExpenseFormValues,
  InstallmentBasisType,
  RecurringPeriodType,
  RepeatKindType,
} from "@/types/expenseTypes";

interface RepeatFieldsProps {
  values: ExpenseFormValues;
  errors: { months?: string; installmentCount?: string };
  /** 개월 수·회차 칸의 id (첫 오류 칸으로 포커스할 때 쓴다) */
  ids: { months: string; installmentCount: string };
  /** 수정 화면: 지금 값을 채운 채 모두 잠그고 안내한다 */
  locked: boolean;
  /** 입력 아래 미리보기 줄 */
  preview: string[];
  onRepeatChange: (repeat: RepeatKindType) => void;
  onPeriodChange: (period: RecurringPeriodType) => void;
  onMonthsChange: (raw: string) => void;
  onBasisChange: (basis: InstallmentBasisType) => void;
  onCountChange: (raw: string) => void;
  onMonthsBlur: () => void;
  onCountBlur: () => void;
}

const REPEAT_OPTIONS = [
  { value: "none", label: REPEAT_TEXTS.none },
  { value: "recurring", label: REPEAT_TEXTS.recurring },
  { value: "installment", label: REPEAT_TEXTS.installment },
] as const;

const PERIOD_OPTIONS = [
  { value: "continuous", label: REPEAT_TEXTS.continuous },
  { value: "months", label: REPEAT_TEXTS.months },
] as const;

const BASIS_OPTIONS = [
  { value: "perCount", label: REPEAT_TEXTS.perCount },
  { value: "total", label: REPEAT_TEXTS.total },
] as const;

const Label = ({ children }: { children: string }) => (
  <p className="text-body text-text01">{children}</p>
);

// 반복 3단 선택과 반복 입력·미리보기 (화면 명세 SC-06 반복 입력, 와이어프레임 ⑤⑥⑦⑬)
const RepeatFields = ({
  values,
  errors,
  ids,
  locked,
  preview,
  onRepeatChange,
  onPeriodChange,
  onMonthsChange,
  onBasisChange,
  onCountChange,
  onMonthsBlur,
  onCountBlur,
}: RepeatFieldsProps) => {
  const lockedHint = locked && (
    <p className="text-caption text-text02">{FIELD_HINTS.repeatLocked}</p>
  );
  const countProps = {
    placeholder: PLACEHOLDERS.repeatCount,
    maxDigits: SERIES_RULES.repeatDigits,
    disabled: locked,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>{FIELD_LABELS.repeat}</Label>
        <Segment
          aria-label={FIELD_LABELS.repeat}
          options={REPEAT_OPTIONS}
          value={values.repeat}
          onValueChange={onRepeatChange}
          disabled={locked}
        />
        {values.repeat === "none" && lockedHint}
      </div>

      {values.repeat === "recurring" && (
        <div className="flex flex-col gap-2">
          <Label>{FIELD_LABELS.period}</Label>
          <Segment
            aria-label={FIELD_LABELS.period}
            options={PERIOD_OPTIONS}
            value={values.recurringPeriod}
            onValueChange={onPeriodChange}
            disabled={locked}
          />
          {values.recurringPeriod === "months" && (
            <NumberInput
              {...countProps}
              id={ids.months}
              aria-label={ARIA_LABELS.repeatMonths}
              value={values.months}
              onValueChange={onMonthsChange}
              unit={REPEAT_TEXTS.monthUnit}
              error={errors.months}
              onBlur={onMonthsBlur}
            />
          )}
          {lockedHint}
        </div>
      )}

      {values.repeat === "installment" && (
        <div className="flex flex-col gap-2">
          <Label>{FIELD_LABELS.installmentBasis}</Label>
          <Segment
            aria-label={FIELD_LABELS.installmentBasis}
            options={BASIS_OPTIONS}
            value={values.installmentBasis}
            onValueChange={onBasisChange}
            disabled={locked}
          />
          <NumberInput
            {...countProps}
            id={ids.installmentCount}
            aria-label={ARIA_LABELS.installmentCount}
            value={values.installmentCount}
            onValueChange={onCountChange}
            unit={REPEAT_TEXTS.countUnit}
            error={errors.installmentCount}
            onBlur={onCountBlur}
          />
          {lockedHint}
        </div>
      )}

      {preview.length > 0 && (
        <div className="flex flex-col gap-1 text-caption text-text02">
          {preview.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepeatFields;
