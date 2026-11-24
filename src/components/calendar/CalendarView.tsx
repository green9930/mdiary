"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";

import CalendarHeader from "@/components/calendar/CalendarHeader";
import DayExpenseList from "@/components/calendar/DayExpenseList";
import MonthGrid from "@/components/calendar/MonthGrid";
import MonthPickerSheet from "@/components/calendar/MonthPickerSheet";
import ExpenseDetailSheet from "@/components/expense/ExpenseDetailSheet";
import LoadError from "@/components/states/LoadError";
import RefreshErrorBar from "@/components/states/RefreshErrorBar";
import {
  SkeletonArea,
  SkeletonBlock,
  SkeletonLine,
  SkeletonListItem,
} from "@/components/states/Skeleton";
import { useCalendarQuery } from "@/hooks/useCalendarQuery";
import { useDayExpenses } from "@/hooks/useDayExpenses";
import { useExpenseSheetQuery } from "@/hooks/useExpenseSheetQuery";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";
import { useMonthSwipe } from "@/hooks/useMonthSwipe";
import { useCachedMonthTotals, useMonthTotals } from "@/hooks/useMonthTotals";
import { addMonths, isMaxMonth, isMinMonth, monthOf } from "@/lib/date";
import { editExpensePath, newExpensePath } from "@/lib/navigation";
import { getQueryView } from "@/lib/queryView";
import { PAGE_TITLES } from "@/shared/sharedConstants";
import type { MonthTotals } from "@/types/expenseTypes";

interface CalendarViewProps {
  today: string; // yyyy-mm-dd
}

const toTotalsMap = (totals: MonthTotals | undefined) =>
  Object.fromEntries(totals?.days.map((day) => [day.date, day.total]) ?? []);

interface MonthPanelProps {
  month: string;
  today: string;
}

// 스와이프 중 보이는 옆 달. 이미 불러온 금액만 보여주고 누를 수 없다
const MonthPanel = ({ month, today }: MonthPanelProps) => {
  const totals = useCachedMonthTotals(month);
  return (
    <div aria-hidden inert className="w-full shrink-0">
      <MonthGrid
        month={month}
        selected={null}
        today={today}
        totals={toTotalsMap(totals)}
        onSelect={() => {}}
      />
    </div>
  );
};

// 달력 영역 첫 로딩 (와이어프레임 SC-03 ④): 달력 격자 + 목록 스켈레톤
const CalendarSkeleton = () => {
  return (
    <SkeletonArea>
      <SkeletonBlock height="calendar" />
      <SkeletonLine width="1/2" />
      <SkeletonListItem />
      <SkeletonListItem />
    </SkeletonArea>
  );
};

// 월간 달력 (화면 명세 SC-03): 헤더 + 6줄 달력(스와이프) + 선택한 날짜의 목록
const CalendarView = ({ today }: CalendarViewProps) => {
  const router = useRouter();
  const sheet = useExpenseSheetQuery();
  const { month, date, selectDate, moveToMonth } = useCalendarQuery(today);
  const totalsQuery = useMonthTotals(month);
  const dayQuery = useDayExpenses(date);
  const totalsView = getQueryView(totalsQuery);
  const dayView = getQueryView(dayQuery);

  const thisMonth = monthOf(today);
  const canPrev = !isMinMonth(month);
  const canNext = !isMaxMonth(month);
  const prevMonth = addMonths(month, -1);
  const nextMonth = addMonths(month, 1);

  const swipe = useMonthSwipe({
    canPrev,
    canNext,
    onPrev: () => moveToMonth(prevMonth),
    onNext: () => moveToMonth(nextMonth),
  });

  // 첫 로딩만 달력 격자를 스켈레톤으로 그린다. 그 뒤 달을 옮기면 날짜를 먼저 그리고 금액을 채운다
  const [loadedOnce, setLoadedOnce] = useState(false);
  if (!loadedOnce && totalsQuery.data) setLoadedOnce(true);

  // 다른 날짜를 불러오는 동안 보이는 이전 목록은 그 목록의 날짜로 요약한다
  const [listDate, setListDate] = useState(date);
  if (!dayQuery.isPlaceholderData && dayQuery.data && listDate !== date)
    setListDate(date);

  const [pickerOpen, setPickerOpen] = useState(false);
  // 시트가 쌓은 기록을 되돌린 뒤 옮긴다. 먼저 옮기면 되돌릴 때 바뀐 주소가 사라진다
  const [picked, setPicked] = useState<{ month: string } | null>(null);
  const moveAfterSheet = useEffectEvent((target: string) => {
    runAfterLayerPops(() => moveToMonth(target));
  });
  useEffect(() => {
    if (picked) moveAfterSheet(picked.month);
  }, [picked]);

  const retry = () => {
    void totalsQuery.refetch();
    void dayQuery.refetch();
  };
  const retrying = totalsQuery.isFetching || dayQuery.isFetching;

  const renderArea = () => {
    if (totalsView.view === "loadError")
      return <LoadError onRetry={retry} retrying={retrying} />;
    if (!loadedOnce) return <CalendarSkeleton />;

    return (
      <>
        {(totalsView.refreshFailed || dayView.refreshFailed) && (
          <RefreshErrorBar onRetry={retry} retrying={retrying} />
        )}
        <div className="touch-pan-y overflow-hidden" {...swipe.handlers}>
          <div
            className={`flex ${
              swipe.settling ? "transition-transform duration-200 ease-out" : ""
            }`}
            style={{
              transform: `translateX(calc(-100% + ${swipe.offset}px))`,
            }}
          >
            <MonthPanel month={prevMonth} today={today} />
            <div className="w-full shrink-0">
              <MonthGrid
                month={month}
                selected={date}
                today={today}
                totals={toTotalsMap(totalsQuery.data)}
                onSelect={selectDate}
              />
            </div>
            <MonthPanel month={nextMonth} today={today} />
          </div>
        </div>
        {dayView.view === "loadError" && (
          <LoadError
            onRetry={() => void dayQuery.refetch()}
            retrying={dayQuery.isFetching}
          />
        )}
        {dayView.view === "skeleton" && (
          <SkeletonArea>
            <SkeletonLine width="1/2" />
            <SkeletonListItem />
            <SkeletonListItem />
          </SkeletonArea>
        )}
        {dayView.view === "data" && dayQuery.data && (
          <DayExpenseList
            date={dayQuery.isPlaceholderData ? listDate : date}
            today={today}
            items={dayQuery.data}
            onAdd={() => router.push(newExpensePath(date))}
            onSelect={sheet.open}
          />
        )}
      </>
    );
  };

  return (
    <main className="flex flex-col">
      <h1 className="sr-only">{PAGE_TITLES.calendar}</h1>
      <CalendarHeader
        month={month}
        total={totalsQuery.data?.total}
        canPrev={canPrev}
        canNext={canNext}
        showToday={month !== thisMonth}
        onPrev={() => moveToMonth(prevMonth)}
        onNext={() => moveToMonth(nextMonth)}
        onToday={() => moveToMonth(thisMonth)}
        onOpenPicker={() => setPickerOpen(true)}
      />
      <div className="flex flex-col gap-3 px-4 pb-6">{renderArea()}</div>
      <MonthPickerSheet
        open={pickerOpen}
        month={month}
        currentMonth={thisMonth}
        onSelect={(target) => setPicked({ month: target })}
        onClose={() => setPickerOpen(false)}
      />
      <ExpenseDetailSheet
        expenseId={sheet.expenseId}
        onClose={sheet.close}
        onEdit={(id) =>
          sheet.handleAfterClose(() => router.push(editExpensePath(id)))
        }
      />
    </main>
  );
};

export default CalendarView;
