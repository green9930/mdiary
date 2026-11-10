// 스피너 (토큰 5-6): 지름 16, 선 2, 색은 놓인 자리의 글자색
interface SpinnerProps {
  label?: string;
}

const Spinner = ({ label }: SpinnerProps) => {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
};

export default Spinner;
