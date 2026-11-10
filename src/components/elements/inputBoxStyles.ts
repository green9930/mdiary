// 입력칸 테두리·면 (토큰 5-2). 포커스·오류의 2px 테두리는 안쪽 outline으로 그려 크기가 변하지 않게 한다.
// 세로 정렬은 쓰는 쪽이 정한다 (한 줄 입력 items-center, textarea items-start)
export const inputBoxClass = ({
  invalid,
  disabled,
}: {
  invalid: boolean;
  disabled: boolean;
}) =>
  `flex gap-2 rounded-md border px-3.5 text-body-lg ${
    disabled
      ? "border-line bg-surface text-on-disabled"
      : invalid
        ? "border-danger-text bg-bg text-text01 outline-2 -outline-offset-2 outline-danger-text"
        : "border-line-input bg-bg text-text01 focus-within:border-accent focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-accent"
  }`;

// 입력칸 안의 실제 <input>·<textarea>: 테두리·면은 바깥 상자가 그린다
export const inputControlClass =
  "min-w-0 flex-1 bg-transparent outline-none placeholder:text-text03 disabled:text-on-disabled";
