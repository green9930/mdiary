"use client";

import { useState } from "react";

import IconButton from "@/components/elements/IconButton";
import { formatMonthNumber, formatYear } from "@/lib/date";
import { ARIA_LABELS, DATE_RULES } from "@/shared/sharedConstants";
import ArrowLeftIcon from "@/assets/icon_arrow_left.svg";

interface MonthPickerGridProps {
  /** 지금 보고 있는 달 (YYYY-MM). 처음 보여줄 해도 이 달의 해다 */
  selected: string;
  /** 이번 달 (YYYY-MM) */
  currentMonth: string;
  onSelect: (month: string) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const MIN_YEAR = Number(DATE_RULES.minDate.slice(0, 4));
const MAX_YEAR = Number(DATE_RULES.maxDate.slice(0, 4));

const toMonth = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

// 지금 보고 있는 달은 채움, 이번 달은 테두리 (화면 명세 SC-03 연·월 선택)
const monthClass = (isSelected: boolean, isCurrent: boolean) => {
  if (isSelected) return "bg-primary font-bold text-white";
  return isCurrent ? "border-2 border-primary text-text01" : "text-text01";
};

// 연도 좌우 이동 + 1~12월 격자 (와이어프레임 SC-03 ⑦). 기록 없는 달도 고를 수 있다
const MonthPickerGrid = ({
  selected,
  currentMonth,
  onSelect,
}: MonthPickerGridProps) => {
  const [year, setYear] = useState(Number(selected.slice(0, 4)));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <IconButton
          aria-label={ARIA_LABELS.prevYear}
          disabled={year <= MIN_YEAR}
          onClick={() => setYear(year - 1)}
        >
          <ArrowLeftIcon />
        </IconButton>
        <p className="text-body-strong">{formatYear(year)}</p>
        <IconButton
          aria-label={ARIA_LABELS.nextYear}
          disabled={year >= MAX_YEAR}
          onClick={() => setYear(year + 1)}
        >
          <ArrowLeftIcon className="-scale-x-100" />
        </IconButton>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {MONTHS.map((month) => {
          const value = toMonth(year, month);
          return (
            <button
              key={month}
              type="button"
              aria-pressed={value === selected}
              aria-current={value === currentMonth ? "date" : undefined}
              onClick={() => onSelect(value)}
              className={`h-11 rounded-md text-body ${monthClass(
                value === selected,
                value === currentMonth,
              )}`}
            >
              {formatMonthNumber(month)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthPickerGrid;
