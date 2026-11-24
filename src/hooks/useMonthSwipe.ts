import { type MouseEvent, type PointerEvent, useRef, useState } from "react";

// 폭의 이만큼 이상 밀거나 빠르게 튕기면 넘어간다 (화면 명세 SC-03)
const COMMIT_RATIO = 0.25;
const COMMIT_VELOCITY = 0.5; // px/ms
// 이만큼 움직인 뒤 가로·세로 중 큰 쪽으로 방향을 정한다
const AXIS_LOCK = 8;
// 범위 끝에서 끌 때 따라오는 비율 (제자리로 돌아올 것을 보여준다)
const EDGE_RESISTANCE = 0.2;
const SWIPE_DURATION = 200; // 넘어가거나 돌아오는 움직임 (ms)

interface MonthSwipeOptions {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

interface Drag {
  startX: number;
  startY: number;
  startTime: number;
  axis: "x" | "y" | null;
}

/**
 * 달력 좌우 스와이프 (화면 명세 SC-03). 왼쪽으로 밀면 다음 달, 오른쪽이면 지난달.
 * offset만큼 달력 줄을 옮겨 그리고, 넘어가면 움직임이 끝난 뒤 onPrev·onNext를 부른다.
 * 세로로 미는 것은 가로채지 않는다 (감싸는 요소에 touch-action: pan-y)
 */
export const useMonthSwipe = ({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: MonthSwipeOptions) => {
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const [offset, setOffset] = useState(0);
  const [settling, setSettling] = useState(false);

  const settle = (to: number, after?: () => void) => {
    setSettling(true);
    setOffset(to);
    window.setTimeout(() => {
      after?.();
      setSettling(false);
      setOffset(0);
    }, SWIPE_DURATION);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (settling) return;
    dragged.current = false;
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      axis: null,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (current.axis === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (current.axis === "x")
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (current.axis !== "x") return;
    dragged.current = true;
    const blocked = (dx > 0 && !canPrev) || (dx < 0 && !canNext);
    setOffset(blocked ? dx * EDGE_RESISTANCE : dx);
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current || current.axis !== "x") return;
    const dx = event.clientX - current.startX;
    const elapsed = Math.max(1, performance.now() - current.startTime);
    const width = event.currentTarget.offsetWidth;
    const far = Math.abs(dx) >= width * COMMIT_RATIO;
    const fast = Math.abs(dx) / elapsed > COMMIT_VELOCITY;
    if ((far || fast) && dx < 0 && canNext) settle(-width, onNext);
    else if ((far || fast) && dx > 0 && canPrev) settle(width, onPrev);
    else settle(0);
  };

  const onPointerCancel = () => {
    if (drag.current?.axis === "x") settle(0);
    drag.current = null;
  };

  // 끌기가 끝난 자리의 날짜가 눌리지 않게 한다
  const onClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  return {
    /** 달력 줄을 옮길 거리 (px). 음수면 왼쪽 */
    offset,
    /** 넘어가거나 돌아오는 움직임 중 (transition을 켠다) */
    settling,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    },
  };
};
