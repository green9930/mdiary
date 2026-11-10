import type { ReactNode } from "react";

interface IconButtonProps {
  /** 아이콘 (24) */
  children: ReactNode;
  /** 아이콘만 있으므로 읽어 줄 이름이 꼭 필요하다 */
  "aria-label": string;
  disabled?: boolean;
  onClick?: () => void;
}

// 아이콘 버튼: 44×44 누르는 영역 가운데에 아이콘 24 (헤더 [‹], 시트 닫기 등)
const IconButton = ({
  children,
  "aria-label": ariaLabel,
  disabled = false,
  onClick,
}: IconButtonProps) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center text-text01 disabled:text-on-disabled [&>svg]:size-6"
    >
      {children}
    </button>
  );
};

export default IconButton;
