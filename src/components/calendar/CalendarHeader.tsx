import Button from "@/components/elements/Button";
import IconButton from "@/components/elements/IconButton";
import { SkeletonArea, SkeletonLine } from "@/components/states/Skeleton";
import { formatAmount } from "@/lib/amount";
import { formatMonth } from "@/lib/date";
import {
  ARIA_LABELS,
  BTN_TEXTS,
  CALENDAR_TEXTS,
} from "@/shared/sharedConstants";
import ArrowDropIcon from "@/assets/icon_arrow_drop_up.svg";
import ArrowLeftIcon from "@/assets/icon_arrow_left.svg";

interface CalendarHeaderProps {
  /** 보고 있는 달 (YYYY-MM) */
  month: string;
  /** 월 합계. 불러오는 중이면 undefined */
  total: number | undefined;
  canPrev: boolean;
  canNext: boolean;
  /** 이번 달이 아닌 달을 볼 때 [오늘]을 보여준다 */
  showToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenPicker: () => void;
}

// 달력 헤더 (와이어프레임 SC-03 ①~④): 연·월 ▾ · [오늘] · ‹ › + 월 합계
const CalendarHeader = ({
  month,
  total,
  canPrev,
  canNext,
  showToday,
  onPrev,
  onNext,
  onToday,
  onOpenPicker,
}: CalendarHeaderProps) => {
  return (
    <header className="flex flex-col gap-1 px-4 pb-2">
      <div className="flex h-13 items-center justify-between">
        <button
          type="button"
          aria-label={`${formatMonth(month)} ${ARIA_LABELS.openMonthPicker}`}
          aria-haspopup="dialog"
          onClick={onOpenPicker}
          className="flex h-11 items-center gap-0.5 text-title-md text-text01"
        >
          {formatMonth(month)}
          <ArrowDropIcon className="size-6 rotate-180 text-text02" />
        </button>
        <div className="flex items-center gap-1">
          {showToday && (
            <Button variant="line" size="sm" onClick={onToday}>
              {BTN_TEXTS.today}
            </Button>
          )}
          <IconButton
            aria-label={ARIA_LABELS.prevMonth}
            disabled={!canPrev}
            onClick={onPrev}
          >
            <ArrowLeftIcon />
          </IconButton>
          <IconButton
            aria-label={ARIA_LABELS.nextMonth}
            disabled={!canNext}
            onClick={onNext}
          >
            <ArrowLeftIcon className="-scale-x-100" />
          </IconButton>
        </div>
      </div>
      <div className="flex min-h-7 items-center justify-end gap-2">
        <p className="text-body text-text02">{CALENDAR_TEXTS.totalLabel}</p>
        {total === undefined ? (
          <div className="w-24">
            <SkeletonArea>
              <SkeletonLine width="full" />
            </SkeletonArea>
          </div>
        ) : (
          <p className="font-num text-num-lg text-text01">
            {formatAmount(total)}
          </p>
        )}
      </div>
    </header>
  );
};

export default CalendarHeader;
