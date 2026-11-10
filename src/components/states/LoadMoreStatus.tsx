import Button from "@/components/elements/Button";
import Spinner from "@/components/elements/Spinner";
import { ARIA_LABELS, BTN_TEXTS, STATE_TEXTS } from "@/shared/sharedConstants";

interface LoadMoreStatusProps {
  loading: boolean; // 다음 장을 불러오는 중
  failed: boolean; // 다음 장 불러오기 실패
  onRetry: () => void;
}

// 무한 스크롤 목록 끝 (와이어프레임 CM ④): 작은 로딩 표시, 실패하면 [다시 시도]. 자동 재시도는 없다
const LoadMoreStatus = ({ loading, failed, onRetry }: LoadMoreStatusProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4 text-text03">
        <Spinner label={ARIA_LABELS.loading} />
      </div>
    );
  }
  if (!failed) return null;
  return (
    <div className="flex items-center justify-center gap-2 py-3 text-caption text-text02">
      <p>{STATE_TEXTS.loadMoreFailed}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {BTN_TEXTS.retry}
      </Button>
    </div>
  );
};

export default LoadMoreStatus;
