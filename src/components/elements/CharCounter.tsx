// 글자 수 카운터 n/25 (CG ③, 토큰 5-2): 한도에 닿으면 강조
interface CharCounterProps {
  count: number;
  max: number;
}

const CharCounter = ({ count, max }: CharCounterProps) => {
  const shown = Math.min(count, max);
  return (
    <span
      aria-hidden
      className={`shrink-0 font-num text-caption tabular-nums ${
        shown >= max ? "text-text02" : "text-text03"
      }`}
    >
      {shown}/{max}
    </span>
  );
};

export default CharCounter;
