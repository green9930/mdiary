import Button from "@/components/elements/Button";
import ScopeFields from "@/components/expense/ScopeFields";
import BottomSheet from "@/components/overlays/BottomSheet";
import { useScopeSelection } from "@/hooks/useScopeSelection";
import { BTN_TEXTS, SHEET_TITLES } from "@/shared/sharedConstants";
import type { ScopeType, SeriesKindType } from "@/types/expenseTypes";

interface ScopeEditSheetProps {
  open: boolean;
  /** 이 건의 id */
  id: string;
  seriesType: SeriesKindType;
  /** 이 건의 원래 날짜 */
  originalDate: string;
  /** 수정 폼의 날짜 */
  date: string;
  /** 저장 요청 중 */
  saving: boolean;
  onSave: (scope: ScopeType) => void;
  /** 닫으면 아무것도 하지 않는다 (폼 입력값 유지) */
  onClose: () => void;
}

// 반복 기록 수정 범위 시트 (화면 명세 SC-09, 와이어프레임 ①②⑧⑨). SC-06 [저장]에서 연다
const ScopeEditSheet = ({
  open,
  id,
  seriesType,
  originalDate,
  date,
  saving,
  onSave,
  onClose,
}: ScopeEditSheetProps) => {
  const selection = useScopeSelection({ open, id, originalDate, date });

  const save = () => {
    const selected = selection.submit();
    if (selected) onSave(selected.scope);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={SHEET_TITLES.scopeEdit}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="line" disabled={saving} onClick={onClose}>
            {BTN_TEXTS.cancel}
          </Button>
          <Button loading={saving} disabled={!selection.ready} onClick={save}>
            {BTN_TEXTS.save}
          </Button>
        </div>
      }
    >
      <ScopeFields selection={selection} seriesType={seriesType} />
    </BottomSheet>
  );
};

export default ScopeEditSheet;
