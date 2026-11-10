"use client";

import IconButton from "@/components/elements/IconButton";
import { useGoBack } from "@/hooks/useGoBack";
import { ARIA_LABELS } from "@/shared/sharedConstants";
import ArrowLeftIcon from "@/assets/icon_arrow_left.svg";

interface PageHeaderProps {
  title: string;
  /** 요청 중에는 [뒤로]도 막는다 (와이어프레임 CG ①) */
  backDisabled?: boolean;
}

// 하위 화면 헤더 (토큰 5-7): [‹] + 제목
const PageHeader = ({ title, backDisabled = false }: PageHeaderProps) => {
  const goBack = useGoBack();

  return (
    <header className="flex h-13 items-center gap-1 pr-4">
      <IconButton
        aria-label={ARIA_LABELS.back}
        onClick={goBack}
        disabled={backDisabled}
      >
        <ArrowLeftIcon />
      </IconButton>
      <h1 className="text-title-md">{title}</h1>
    </header>
  );
};

export default PageHeader;
