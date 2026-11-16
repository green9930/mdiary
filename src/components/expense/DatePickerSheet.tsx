"use client";

import { useState } from "react";

import MonthGrid from "@/components/calendar/MonthGrid";
import Button from "@/components/elements/Button";
import IconButton from "@/components/elements/IconButton";
import BottomSheet from "@/components/overlays/BottomSheet";
import { addMonths, formatMonth, isMaxMonth, monthOf } from "@/lib/date";
import { ARIA_LABELS, BTN_TEXTS, SHEET_TITLES } from "@/shared/sharedConstants";
import ArrowLeftIcon from "@/assets/icon_arrow_left.svg";

interface DatePickerSheetProps {
  open: boolean;
  /** 지금 날짜 (YYYY-MM-DD) */
  value: string;
  today: string;
  /** [선택]을 눌렀을 때 고른 날짜 */
  onSelect: (date: string) => void;
  onClose: () => void;
}

// 날짜 선택 바텀시트 (와이어프레임 SC-06 ⑧): ‹ 연월 › + 6줄 달력 + [선택].
// 고르기만 하고 닫으면 날짜를 바꾸지 않는다
const DatePickerSheet = ({
  open,
  value,
  today,
  onSelect,
  onClose,
}: DatePickerSheetProps) => {
  const [picked, setPicked] = useState(value);
  const [month, setMonth] = useState(monthOf(value));
  const [wasOpen, setWasOpen] = useState(open);

  // 열 때마다 지금 날짜에서 시작한다
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPicked(value);
      setMonth(monthOf(value));
    }
  }

  const pick = (date: string) => {
    setPicked(date);
    setMonth(monthOf(date));
  };

  const confirm = () => {
    onSelect(picked);
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={SHEET_TITLES.datePicker}
      footer={
        <Button size="lg" onClick={confirm}>
          {BTN_TEXTS.select}
        </Button>
      }
    >
      <div className="flex items-center justify-between">
        <IconButton
          aria-label={ARIA_LABELS.prevMonth}
          onClick={() => setMonth(addMonths(month, -1))}
        >
          <ArrowLeftIcon />
        </IconButton>
        <p className="text-body-strong">{formatMonth(month)}</p>
        <IconButton
          aria-label={ARIA_LABELS.nextMonth}
          disabled={isMaxMonth(month)}
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <ArrowLeftIcon className="-scale-x-100" />
        </IconButton>
      </div>
      <MonthGrid
        month={month}
        selected={picked}
        today={today}
        onSelect={pick}
      />
    </BottomSheet>
  );
};

export default DatePickerSheet;
