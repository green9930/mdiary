import Button from "@/components/elements/Button";

interface EmptyStateProps {
  message: string; // 기록이 0건인지, 조건 결과가 없는지에 따라 문구를 다르게 쓴다 (화면 명세 공통 규약)
  actionLabel?: string; // 있으면 버튼 하나 (예: 기록 추가하기)
  onAction?: () => void;
}

// 빈 상태 (토큰 5-6): 문구 가운데 정렬, 버튼은 primary outline md
const EmptyState = ({ message, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-15 text-center">
      <p className="text-body text-text02">{message}</p>
      {actionLabel && (
        <Button variant="outline" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
