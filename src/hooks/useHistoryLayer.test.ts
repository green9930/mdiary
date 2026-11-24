// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  resetHistoryLayers,
  runAfterLayerPops,
  useHistoryLayer,
} from "@/hooks/useHistoryLayer";

// 층이 기록을 쌓을 때까지 (다음 틱)
const pushed = () => new Promise((resolve) => setTimeout(resolve, 10));

describe("runAfterLayerPops", () => {
  beforeEach(() => resetHistoryLayers());

  it("되돌릴 기록이 없으면 바로 실행한다", () => {
    const callback = vi.fn();
    runAfterLayerPops(callback);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("층을 닫아 기록을 되돌리는 중이면, 되돌린 뒤 실행한다", async () => {
    const { rerender } = renderHook(
      ({ open }) => useHistoryLayer(open, "close"),
      { initialProps: { open: true } },
    );
    await pushed();
    const length = window.history.length;

    rerender({ open: false });
    const callback = vi.fn();
    runAfterLayerPops(callback);
    expect(callback).not.toHaveBeenCalled();

    await waitFor(() => expect(callback).toHaveBeenCalledOnce());
    expect(window.history.state?.mdiaryLayer).toBeUndefined();
    expect(window.history.length).toBe(length);
  });

  it("되돌리는 중에 새 층이 열리면, 되돌린 뒤에 쌓는다", async () => {
    // 날짜 시트 [선택]: 시트가 닫히며(되돌리기) 같은 렌더에서 작성 중 가로채기가 열린다
    const { rerender } = renderHook(
      ({ first }) => {
        useHistoryLayer(first, "close");
        useHistoryLayer(!first, "close");
      },
      { initialProps: { first: true } },
    );
    await pushed();

    // 부하가 있으면 새 층의 쌓기(setTimeout)가 되돌리기(jsdom은 setImmediate)보다 먼저 실행된다
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      rerender({ first: false });
      vi.advanceTimersByTime(0);
    } finally {
      vi.useRealTimers();
    }
    const callback = vi.fn();
    runAfterLayerPops(callback);

    await waitFor(() => expect(callback).toHaveBeenCalledOnce());
    expect(window.history.state?.mdiaryLayer).toBeDefined();
    // 남은 기록은 새 층 하나뿐이다: 한 번 되돌리면 층이 없는 기록이다
    window.history.back();
    await waitFor(() =>
      expect(window.history.state?.mdiaryLayer).toBeUndefined(),
    );
  });
});
