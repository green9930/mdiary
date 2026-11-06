"use client";

import { useGoBack } from "@/hooks/useGoBack";
import ArrowLeftIcon from "@/assets/icon_arrow_left.svg";

// 하위 화면 헤더 (토큰 5-7): [‹] + 제목
const PageHeader = ({ title }: { title: string }) => {
  const goBack = useGoBack();

  return (
    <header className="flex h-13 items-center gap-1 pr-4">
      <button
        type="button"
        aria-label="뒤로"
        onClick={goBack}
        className="grid size-11 place-items-center"
      >
        <ArrowLeftIcon className="size-6" />
      </button>
      <h1 className="text-title-m">{title}</h1>
    </header>
  );
};

export default PageHeader;
