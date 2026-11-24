import ListItem from "@/components/elements/ListItem";
import SeriesBadge from "@/components/expense/SeriesBadge";
import EmptyState from "@/components/states/EmptyState";
import { formatAmount } from "@/lib/amount";
import { formatDayHeading } from "@/lib/date";
import {
  BTN_TEXTS,
  CALENDAR_TEXTS,
  STATE_TEXTS,
} from "@/shared/sharedConstants";
import type { ExpenseListItem } from "@/types/expenseTypes";

interface DayExpenseListProps {
  /** 선택한 날짜 (YYYY-MM-DD) */
  date: string;
  today: string;
  /** 등록 순 */
  items: ExpenseListItem[];
  /** [기록 추가하기]: 이 날짜로 등록 화면을 연다 */
  onAdd: () => void;
}

// 선택한 날짜의 목록 (와이어프레임 SC-03 ⑧~⑪): 요약 + 항목, 없으면 빈 상태
const DayExpenseList = ({ date, today, items, onAdd }: DayExpenseListProps) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const count = CALENDAR_TEXTS.dayCount(items.length);

  return (
    <section className="flex flex-col">
      <div className="flex h-10 items-center justify-between border-b border-line">
        <h2 className="text-body-strong text-text01">
          {formatDayHeading(date, today)}
        </h2>
        <p className="text-caption text-text02">
          {items.length > 0 ? `${count} · ${formatAmount(total)}` : count}
        </p>
      </div>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <ListItem
                category={item.category}
                title={item.title}
                badge={item.series && <SeriesBadge series={item.series} />}
                amount={formatAmount(item.amount)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          message={STATE_TEXTS.noRecords}
          actionLabel={BTN_TEXTS.addRecord}
          onAction={onAdd}
        />
      )}
    </section>
  );
};

export default DayExpenseList;
