import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 아이콘만 있으므로 읽어 줄 이름이 꼭 필요하다 */
  "aria-label": string;
}

// 아이콘 버튼: 44×44 누르는 영역 가운데에 아이콘 24 (헤더 [‹], 시트 닫기 등)
const IconButton = ({
  type = "button",
  className,
  children,
  ...props
}: IconButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "grid size-11 shrink-0 place-items-center text-text disabled:text-on-disabled [&>svg]:size-6",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
