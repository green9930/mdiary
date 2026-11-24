"use client";

import { useState } from "react";

import MonthGrid from "@/components/calendar/MonthGrid";
import MonthPickerGrid from "@/components/calendar/MonthPickerGrid";
import Button from "@/components/elements/Button";
import IconButton from "@/components/elements/IconButton";
import BottomSheet from "@/components/overlays/BottomSheet";
import {
  addMonths,
  formatMonth,
  isMaxMonth,
  isMinMonth,
  monthOf,
} from "@/lib/date";
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
const DatePickerSheet = ({
  open,
  value,
  today,
  onSelect,
  onClose,
}: DatePickerSheetProps) => {
  const [picked, setPicked] = useState(value);
  const [month, setMonth] = useState(monthOf(value));
  const [choosingMonth, setChoosingMonth] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // 열 때마다 지금 날짜의 달력에서 시작한다
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPicked(value);
      setMonth(monthOf(value));
      setChoosingMonth(false);
    }
  }

  const pick = (date: string) => {
    setPicked(date);
    setMonth(monthOf(date));
  };

  const chooseMonth = (target: string) => {
    setMonth(target);
    setChoosingMonth(false);
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
      {choosingMonth ? (
        <MonthPickerGrid
          selected={month}
          currentMonth={monthOf(today)}
          onSelect={chooseMonth}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <IconButton
              aria-label={ARIA_LABELS.prevMonth}
              disabled={isMinMonth(month)}
              onClick={() => setMonth(addMonths(month, -1))}
            >
              <ArrowLeftIcon />
            </IconButton>
            <button
              type="button"
              aria-label={`${formatMonth(month)} ${ARIA_LABELS.openMonthPicker}`}
              onClick={() => setChoosingMonth(true)}
              className="h-11 text-body-strong text-text01"
            >
              {formatMonth(month)}
            </button>
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
        </>
      )}
    </BottomSheet>
  );
};

export default DatePickerSheet;
