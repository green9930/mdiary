import type { ReactNode } from "react";

import { ARIA_LABELS } from "@/shared/sharedConstants";

// 스켈레톤 조각의 면과 깜박임 (토큰 5-6): 움직임 줄이기 설정이면 깜박이지 않는다
// 모서리는 조각마다 따로 준다 (rounded-sm과 rounded-full을 같이 쓰면 CSS 순서로 정해진다)
const PIECE_CLASS = "animate-skeleton bg-surface motion-reduce:animate-none";

const WIDTH_CLASSES = {
  full: "w-full",
  "1/2": "w-1/2",
  "1/3": "w-1/3",
};

interface SkeletonAreaProps {
  children: ReactNode;
}

// 첫 로딩 스켈레톤 영역 (와이어프레임 CM ①). 화면별 모양은 각 기능에서 아래 조각으로 짠다.
// 스크린 리더에는 영역 하나만 "불러오는 중"으로 읽힌다
export const SkeletonArea = ({ children }: SkeletonAreaProps) => {
  return (
    <div
      role="status"
      aria-label={ARIA_LABELS.loading}
      aria-busy
      className="flex flex-col gap-3"
    >
      {children}
    </div>
  );
};

interface SkeletonLineProps {
  width: keyof typeof WIDTH_CLASSES;
}

// 글자 한 줄 자리
export const SkeletonLine = ({ width }: SkeletonLineProps) => {
  return (
    <div
      aria-hidden
      className={`h-4 rounded-sm ${WIDTH_CLASSES[width]} ${PIECE_CLASS}`}
    />
  );
};

// 목록 항목 자리: ListItem과 같은 높이 56, 아이콘 원 36
export const SkeletonListItem = () => {
  return (
    <div
      aria-hidden
      className="flex h-14 items-center gap-3 border-b border-line"
    >
      <div className={`size-9 shrink-0 rounded-full ${PIECE_CLASS}`} />
      <div className={`h-4 flex-1 rounded-sm ${PIECE_CLASS}`} />
      <div className={`h-4 w-16 rounded-sm ${PIECE_CLASS}`} />
    </div>
  );
};
