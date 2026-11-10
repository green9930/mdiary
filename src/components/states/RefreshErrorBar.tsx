import Button from "@/components/elements/Button";
import { BTN_TEXTS, STATE_TEXTS } from "@/shared/sharedConstants";

interface RefreshErrorBarProps {
  onRetry: () => void;
  retrying: boolean; // 다시 조회하는 중: 버튼 비활성
}

// 같은 조건 다시 불러오기 실패 띠 (와이어프레임 CM ③, 토큰 5-6): 보이던 데이터 위에 둔다
const RefreshErrorBar = ({ onRetry, retrying }: RefreshErrorBarProps) => {
  return (
    <div
      role="alert"
      className="flex min-h-11 items-center gap-2 rounded-md bg-surface pr-1 pl-3 text-caption text-text02"
    >
      <p className="min-w-0 flex-1">{STATE_TEXTS.refreshFailed}</p>
      <Button variant="text" size="sm" loading={retrying} onClick={onRetry}>
        {BTN_TEXTS.retry}
      </Button>
    </div>
  );
};

export default RefreshErrorBar;
