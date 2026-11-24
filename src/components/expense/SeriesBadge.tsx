import Badge from "@/components/elements/Badge";
import { BADGE_TEXTS } from "@/shared/sharedConstants";
import type { ExpenseListSeriesType } from "@/types/expenseTypes";

interface SeriesBadgeProps {
  series: ExpenseListSeriesType;
}

// 목록 항목의 반복 배지: 정기 / 할부 3/12
const SeriesBadge = ({ series }: SeriesBadgeProps) => {
  return (
    <Badge>
      {series.type === "RECURRING"
        ? BADGE_TEXTS.recurring
        : BADGE_TEXTS.installment(series.seq, series.totalCount)}
    </Badge>
  );
};

export default SeriesBadge;
