"use client";

import { useState } from "react";

import MonthPickerGrid from "@/components/calendar/MonthPickerGrid";
import BottomSheet from "@/components/overlays/BottomSheet";
import { SHEET_TITLES } from "@/shared/sharedConstants";

interface MonthPickerSheetProps {
  open: boolean;
  /** 지금 보고 있는 달 (YYYY-MM) */
  month: string;
  currentMonth: string;
  /** 월을 누르면 바로 적용하고 닫는다 */
  onSelect: (month: string) => void;
  onClose: () => void;
}

// 연·월 선택 바텀시트 (와이어프레임 SC-03 ⑦)
const MonthPickerSheet = ({
  open,
  month,
  currentMonth,
  onSelect,
  onClose,
}: MonthPickerSheetProps) => {
  // 열 때마다 지금 보고 있는 달의 해에서 시작한다
  const [openCount, setOpenCount] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setOpenCount(openCount + 1);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={SHEET_TITLES.monthPicker}>
      <MonthPickerGrid
        key={openCount}
        selected={month}
        currentMonth={currentMonth}
        onSelect={(picked) => {
          onSelect(picked);
          onClose();
        }}
      />
    </BottomSheet>
  );
};

export default MonthPickerSheet;
