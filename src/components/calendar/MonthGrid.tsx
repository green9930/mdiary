import { formatFullDate, monthGridDates, monthOf } from "@/lib/date";
import { WEEKDAY_LABELS } from "@/shared/sharedConstants";

interface MonthGridProps {
  /** 그릴 달 (YYYY-MM) */
  month: string;
  selected: string | null;
  today: string;
  onSelect: (date: string) => void;
}

const WEEK = WEEKDAY_LABELS.length;

// 요일별 날짜 숫자 색 (토큰 5-5): 일요일 빨강, 토요일 회색
const weekdayClass = (index: number) =>
  index === 0
    ? "text-danger-text"
    : index === WEEK - 1
      ? "text-text02"
      : "text-text01";

// 날짜 원 (지름 26): 선택은 면 primary, 오늘은 테두리 primary, 앞뒤 달은 흐리게
const dayClass = ({
  isSelected,
  isToday,
  inMonth,
  weekday,
}: {
  isSelected: boolean;
  isToday: boolean;
  inMonth: boolean;
  weekday: number;
}) => {
  if (isSelected) return "bg-primary font-bold text-white";
  const color = inMonth ? weekdayClass(weekday) : "text-text03";
  return isToday ? `border-2 border-primary ${color}` : color;
};

// 6줄 고정 달력 (화면 명세 SC-03, 토큰 5-5). 앞뒤 달 날짜도 누를 수 있다
const MonthGrid = ({ month, selected, today, onSelect }: MonthGridProps) => {
  const dates = monthGridDates(month);
  const weeks = Array.from({ length: dates.length / WEEK }, (_, i) =>
    dates.slice(i * WEEK, (i + 1) * WEEK),
  );

  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr>
          {WEEKDAY_LABELS.map((label, index) => (
            <th
              key={label}
              scope="col"
              className={`h-8 text-caption font-normal ${weekdayClass(index)}`}
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]}>
            {week.map((date, weekday) => (
              <td key={date} className="p-0">
                <button
                  type="button"
                  aria-label={formatFullDate(date)}
                  aria-pressed={date === selected}
                  aria-current={date === today ? "date" : undefined}
                  onClick={() => onSelect(date)}
                  className="grid h-12 w-full place-items-center"
                >
                  <span
                    className={`grid size-6.5 place-items-center rounded-full font-num text-num-date ${dayClass(
                      {
                        isSelected: date === selected,
                        isToday: date === today,
                        inMonth: monthOf(date) === month,
                        weekday,
                      },
                    )}`}
                  >
                    {Number(date.slice(8))}
                  </span>
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MonthGrid;
