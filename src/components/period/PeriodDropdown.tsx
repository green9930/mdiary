import Dropdown from "@/components/overlays/Dropdown";
import {
  convertQuickPeriod,
  formatPeriodLabel,
  matchQuickPeriod,
} from "@/lib/periodUtils";
import { CATEGORY_PERIOD_RULES } from "@/shared/expenseConstants";
import { ARIA_LABELS, PERIOD_TEXTS } from "@/shared/sharedConstants";
import type { Period } from "@/types/expenseTypes";

interface PeriodDropdownProps {
  period: Period;
  thisMonth: string;
  /** 빠른 선택을 고르면 바로 그 기간으로 */
  onSelect: (period: Period) => void;
}

// 직접 정한 기간 항목의 값 (빠른 선택의 개월 수와 겹치지 않는다)
const CUSTOM = "custom";

const QUICK_OPTIONS = CATEGORY_PERIOD_RULES.quickMonths.map((months) => ({
  value: String(months),
  label: PERIOD_TEXTS.quick[months],
}));

// 기간 드롭다운 (화면 명세 SC-04·SC-05, 와이어프레임 SC-04 ① ⑨ ⑮).
// 빠른 선택 4개. 직접 정한 기간이 적용 중이면 메뉴 맨 위에 그 기간을 선택으로 보여준다
const PeriodDropdown = ({
  period,
  thisMonth,
  onSelect,
}: PeriodDropdownProps) => {
  const quick = matchQuickPeriod(period, thisMonth);
  const options =
    quick === null
      ? [
          { value: CUSTOM, label: formatPeriodLabel(period, thisMonth) },
          ...QUICK_OPTIONS,
        ]
      : QUICK_OPTIONS;

  return (
    <Dropdown
      aria-label={ARIA_LABELS.period}
      options={options}
      value={quick === null ? CUSTOM : String(quick)}
      onValueChange={(value) => {
        if (value !== CUSTOM)
          onSelect(convertQuickPeriod(Number(value), thisMonth));
      }}
    />
  );
};

export default PeriodDropdown;
