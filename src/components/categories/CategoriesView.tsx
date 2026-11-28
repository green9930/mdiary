"use client";

import { useEffect, useEffectEvent, useState } from "react";

import CategoryShareChart from "@/components/categories/CategoryShareChart";
import IconButton from "@/components/elements/IconButton";
import PeriodDropdown from "@/components/period/PeriodDropdown";
import PeriodPickerSheet from "@/components/period/PeriodPickerSheet";
import EmptyState from "@/components/states/EmptyState";
import LoadError from "@/components/states/LoadError";
import RefreshErrorBar from "@/components/states/RefreshErrorBar";
import { SkeletonArea, SkeletonLine } from "@/components/states/Skeleton";
import { useCategoriesQuery } from "@/hooks/useCategoriesQuery";
import { useCategoryStats } from "@/hooks/useCategoryStats";
import { runAfterLayerPops } from "@/hooks/useHistoryLayer";
import { formatAmount } from "@/lib/amount";
import { monthOf } from "@/lib/date";
import { getQueryView } from "@/lib/queryView";
import {
  ARIA_LABELS,
  PAGE_TITLES,
  STATE_TEXTS,
  STATS_TEXTS,
} from "@/shared/sharedConstants";
import type { Period } from "@/types/expenseTypes";
import CalendarIcon from "@/assets/icon_calendar.svg";

interface CategoriesViewProps {
  today: string; // yyyy-mm-dd
}

// 요약·비중 그래프 첫 로딩
const StatsSkeleton = () => {
  return (
    <SkeletonArea>
      <SkeletonLine width="full" />
      <SkeletonLine width="full" />
      <SkeletonLine width="full" />
      <SkeletonLine width="1/2" />
    </SkeletonArea>
  );
};

// 카테고리별 (화면 명세 SC-04): 기간 드롭다운·[기간 선택] + 기간 요약 + 비중 그래프
const CategoriesView = ({ today }: CategoriesViewProps) => {
  const thisMonth = monthOf(today);
  const { query, setPeriod, setCategory } = useCategoriesQuery(thisMonth);
  const period = { from: query.from, to: query.to };
  const statsQuery = useCategoryStats(period);
  const statsView = getQueryView(statsQuery);

  const [pickerOpen, setPickerOpen] = useState(false);
  // 시트가 쌓은 기록을 되돌린 뒤 옮긴다. 먼저 옮기면 되돌릴 때 바뀐 주소가 사라진다
  const [picked, setPicked] = useState<Period | null>(null);

  const applyAfterSheet = useEffectEvent((target: Period) => {
    runAfterLayerPops(() => setPeriod(target));
  });

  useEffect(() => {
    if (picked) applyAfterSheet(picked);
  }, [picked]);

  const retry = () => void statsQuery.refetch();

  const renderStats = () => {
    if (statsView.view === "loadError")
      return <LoadError onRetry={retry} retrying={statsQuery.isFetching} />;
    if (statsView.view === "skeleton" || !statsQuery.data)
      return <StatsSkeleton />;

    const stats = statsQuery.data;
    return (
      <>
        {statsView.refreshFailed && (
          <RefreshErrorBar onRetry={retry} retrying={statsQuery.isFetching} />
        )}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-body text-text02">
            {STATS_TEXTS.summary(stats.count)}
          </p>
          <p className="font-num text-num-lg text-text01 tabular-nums">
            {formatAmount(stats.total)}
          </p>
        </div>
        {stats.count === 0 ? (
          <EmptyState message={STATE_TEXTS.noPeriodRecords} />
        ) : (
          <CategoryShareChart
            stats={stats}
            selected={query.category}
            onSelect={setCategory}
          />
        )}
      </>
    );
  };

  return (
    <main className="flex flex-col">
      <h1 className="sr-only">{PAGE_TITLES.categories}</h1>
      <header className="flex h-13 items-center justify-between px-4">
        <PeriodDropdown
          period={period}
          thisMonth={thisMonth}
          onSelect={setPeriod}
        />
        <IconButton
          aria-label={ARIA_LABELS.openPeriodPicker}
          onClick={() => setPickerOpen(true)}
        >
          <CalendarIcon />
        </IconButton>
      </header>
      <div className="flex flex-col gap-3 px-4 pb-6">{renderStats()}</div>
      <PeriodPickerSheet
        open={pickerOpen}
        period={period}
        thisMonth={thisMonth}
        onApply={(target) => setPicked({ ...target })}
        onClose={() => setPickerOpen(false)}
      />
    </main>
  );
};

export default CategoriesView;
