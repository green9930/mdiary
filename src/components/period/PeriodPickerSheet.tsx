"use client";

import { useState } from "react";

import MonthPickerGrid from "@/components/calendar/MonthPickerGrid";
import Button from "@/components/elements/Button";
import Segment from "@/components/elements/Segment";
import BottomSheet from "@/components/overlays/BottomSheet";
import { formatMonth } from "@/lib/date";
import { isPeriodWithinMax } from "@/lib/periodUtils";
import {
  ARIA_LABELS,
  BTN_TEXTS,
  PERIOD_TEXTS,
  SHEET_TITLES,
} from "@/shared/sharedConstants";
import type { Period } from "@/types/expenseTypes";

interface PeriodPickerSheetProps {
  open: boolean;
  /** 지금 조회 중인 기간. 열 때마다 이 값에서 시작한다 */
  period: Period;
  thisMonth: string;
  /** [적용]: 고른 기간 */
  onApply: (period: Period) => void;
  onClose: () => void;
}

type FieldType = "start" | "end";

// 기간 선택 바텀시트 (화면 명세 SC-04 기간 선택 바텀시트, 와이어프레임 ⑦⑧).
// 시작·끝 두 칸 중 하나를 골라 연도 이동 + 월 격자로 정한다. 빠른 선택은 드롭다운이 맡는다
const PeriodPickerSheet = ({
  open,
  period,
  thisMonth,
  onApply,
  onClose,
}: PeriodPickerSheetProps) => {
  const [draft, setDraft] = useState(period);
  const [field, setField] = useState<FieldType>("start");
  // 열 때마다 지금 기간·시작 칸에서 시작한다
  const [openCount, setOpenCount] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setOpenCount(openCount + 1);
      setDraft(period);
      setField("start");
    }
  }

  const valid = isPeriodWithinMax(draft);

  // 시작을 끝보다 뒤로 고르면 끝을 시작과 같게 맞춘다
  const select = (month: string) =>
    setDraft(
      field === "start"
        ? { from: month, to: month > draft.to ? month : draft.to }
        : { ...draft, to: month },
    );

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={SHEET_TITLES.periodPicker}
      footer={
        <div className="flex flex-col gap-2">
          {!valid && (
            <p className="text-center text-caption text-danger-text">
              {PERIOD_TEXTS.maxRange}
            </p>
          )}
          <Button size="lg" disabled={!valid} onClick={apply}>
            {BTN_TEXTS.apply}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Segment
          aria-label={ARIA_LABELS.period}
          value={field}
          onValueChange={setField}
          options={[
            {
              value: "start",
              label: `${PERIOD_TEXTS.start} ${formatMonth(draft.from)}`,
            },
            {
              value: "end",
              label: `${PERIOD_TEXTS.end} ${formatMonth(draft.to)}`,
            },
          ]}
        />
        <MonthPickerGrid
          // 칸을 바꾸면 그 칸의 달이 있는 해로 옮긴다
          key={`${openCount}-${field}`}
          selected={field === "start" ? draft.from : draft.to}
          currentMonth={thisMonth}
          range={draft}
          isDisabled={
            field === "end" ? (month) => month < draft.from : undefined
          }
          onSelect={select}
        />
      </div>
    </BottomSheet>
  );
};

export default PeriodPickerSheet;
