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
});
