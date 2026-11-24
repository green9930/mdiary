// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import type { PointerEvent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMonthSwipe } from "@/hooks/useMonthSwipe";

const WIDTH = 400;

const pointer = (clientX: number, clientY = 0) =>
  ({
    clientX,
    clientY,
    pointerId: 1,
    currentTarget: { offsetWidth: WIDTH, setPointerCapture: vi.fn() },
  }) as unknown as PointerEvent<HTMLElement>;

const setup = ({ canPrev = true, canNext = true } = {}) => {
  const onPrev = vi.fn();
  const onNext = vi.fn();
  const hook = renderHook(() =>
    useMonthSwipe({ canPrev, canNext, onPrev, onNext }),
  );
  // startX에서 끝까지 ms 동안 끌고 놓는다
  const drag = (startX: number, endX: number, ms: number, endY = 0) => {
    const { handlers } = hook.result.current;
    act(() => handlers.onPointerDown(pointer(startX)));
    act(() => {
      vi.advanceTimersByTime(ms);
      hook.result.current.handlers.onPointerMove(pointer(endX, endY));
    });
    act(() => hook.result.current.handlers.onPointerUp(pointer(endX, endY)));
    act(() => vi.runAllTimers());
  };
  return { ...hook, onPrev, onNext, drag };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useMonthSwipe (화면 명세 SC-03 스와이프)", () => {
  it("미는 동안 손가락을 따라 움직인다", () => {
    const { result } = setup();
    act(() => result.current.handlers.onPointerDown(pointer(300)));
    act(() => result.current.handlers.onPointerMove(pointer(250)));
    expect(result.current.offset).toBe(-50);
  });

  it("폭의 1/4 이상 왼쪽으로 밀면 다음 달로 간다", () => {
    const { drag, onNext, onPrev, result } = setup();
    drag(300, 190, 1000);
    expect(onNext).toHaveBeenCalledOnce();
    expect(onPrev).not.toHaveBeenCalled();
    expect(result.current.offset).toBe(0);
  });

  it("폭의 1/4 이상 오른쪽으로 밀면 지난달로 간다", () => {
    const { drag, onPrev } = setup();
    drag(100, 210, 1000);
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it("덜 밀면 제자리로 돌아온다", () => {
    const { drag, onNext, onPrev, result } = setup();
    drag(300, 220, 1000);
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
    expect(result.current.offset).toBe(0);
  });

  it("짧게 밀어도 빠르게 튕기면 넘어간다", () => {
    const { drag, onNext } = setup();
    drag(300, 260, 50);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("범위 끝에서는 넘어가지 않고 제자리로 돌아온다", () => {
    const { drag, onPrev } = setup({ canPrev: false });
    drag(100, 300, 1000);
    expect(onPrev).not.toHaveBeenCalled();
  });

  it("위아래로 미는 것은 가로채지 않는다", () => {
    const { drag, onNext, result } = setup();
    drag(300, 280, 50, 120);
    expect(onNext).not.toHaveBeenCalled();
    expect(result.current.offset).toBe(0);
  });
});
