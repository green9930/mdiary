import { useId } from "react";

import Button from "@/components/elements/Button";
import NumberInput from "@/components/elements/NumberInput";
import Radio from "@/components/elements/Radio";
import { SkeletonArea, SkeletonLine } from "@/components/states/Skeleton";
import type { ScopeSelectionType } from "@/hooks/useScopeSelection";
import { SERIES_RULES } from "@/shared/expenseConstants";
import {
  ARIA_LABELS,
  BTN_TEXTS,
  REPEAT_TEXTS,
  STATE_TEXTS,
} from "@/shared/sharedConstants";
import type { SeriesKindType } from "@/types/expenseTypes";

interface ScopeFieldsProps {
  selection: ScopeSelectionType;
  /** 할부면 이후 전체에 "(남은 회차)"를 붙인다 */
  seriesType: SeriesKindType;
}

// 범위 라디오 3개 + N + 비활성 안내 + 범위 미리보기 (와이어프레임 SC-09 ②③④⑩)
const ScopeFields = ({ selection, seriesType }: ScopeFieldsProps) => {
  const name = useId();
  const countId = `${name}-count`;
  const { type, options } = selection;

  const selectCount = () => {
    selection.select("count");
    // 고르면 바로 N을 입력하게 한다
    requestAnimationFrame(() => document.getElementById(countId)?.focus());
  };

  const renderPreview = () => {
    if (selection.previewText)
      return <p className="text-body text-text02">{selection.previewText}</p>;
    if (selection.previewFailed)
      return (
        <div className="flex items-center gap-2">
          <p className="text-body text-text02">{STATE_TEXTS.loadFailed}</p>
          <Button
            variant="text"
            size="md"
            loading={selection.previewRetrying}
            onClick={selection.retryPreview}
          >
            {BTN_TEXTS.retry}
          </Button>
        </div>
      );
    if (!selection.ready)
      return (
        <SkeletonArea>
          <SkeletonLine width="1/2" />
        </SkeletonArea>
      );
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label={ARIA_LABELS.scope}
        className="flex flex-col"
      >
        <Radio
          name={name}
          value="one"
          checked={type === "one"}
          onSelect={() => selection.select("one")}
        >
          {REPEAT_TEXTS.scopeOne}
        </Radio>
        <Radio
          name={name}
          value="after"
          checked={type === "after"}
          disabled={!options.after}
          onSelect={() => selection.select("after")}
        >
          {seriesType === "INSTALLMENT"
            ? REPEAT_TEXTS.scopeAfterInstallment
            : REPEAT_TEXTS.scopeAfter}
        </Radio>
        <div
          className={`flex gap-3 ${selection.nError ? "items-start" : "items-center"}`}
        >
          <Radio
            name={name}
            value="count"
            checked={type === "count"}
            disabled={!options.count}
            onSelect={selectCount}
          >
            {REPEAT_TEXTS.scopeCountPrefix}
          </Radio>
          <NumberInput
            id={countId}
            aria-label={ARIA_LABELS.repeatMonths}
            value={selection.n}
            onValueChange={selection.setN}
            unit={REPEAT_TEXTS.monthUnit}
            maxDigits={SERIES_RULES.repeatDigits}
            disabled={type !== "count"}
            error={selection.nError}
            onBlur={selection.blurN}
            size="md"
          />
        </div>
      </div>
      {options.hint && (
        <p className="text-caption text-text02">{options.hint}</p>
      )}
      {renderPreview()}
    </div>
  );
};

export default ScopeFields;
