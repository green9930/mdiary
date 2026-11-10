import Button from "@/components/elements/Button";
import { BTN_TEXTS, STATE_TEXTS } from "@/shared/sharedConstants";

interface LoadErrorProps {
  onRetry: () => void;
  retrying: boolean; // 다시 조회하는 중: 버튼 비활성
}

// 조회 실패 (와이어프레임 CM ②): 보여줄 데이터가 없을 때 영역을 대신한다
const LoadError = ({ onRetry, retrying }: LoadErrorProps) => {
  return (
    <div className="flex flex-col items-center gap-3 py-15 text-center">
      <p className="text-body text-text02">{STATE_TEXTS.loadFailed}</p>
      <Button variant="outline" size="md" loading={retrying} onClick={onRetry}>
        {BTN_TEXTS.retry}
      </Button>
    </div>
  );
};

export default LoadError;
