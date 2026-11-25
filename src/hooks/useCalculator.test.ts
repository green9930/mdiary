// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCalculator } from "@/hooks/useCalculator";
import { CALCULATOR_TEXTS } from "@/shared/sharedConstants";

const setup = (props = { open: true, amount: "36000", content: "" }) =>
  renderHook((current) => useCalculator(current), { initialProps: props });

describe("useCalculator (화면 명세 SC-07)", () => {
  it("열 때 금액 값으로 시작하고 끝전 처리·기록 체크는 기본값이다", () => {
    const { result } = setup();
    expect(result.current.expression).toBe("36,000");
    expect(result.current.rounding).toEqual({ unit: 1, direction: "down" });
    expect(result.current.record).toBe(true);
  });

  it("키를 누르면 식과 결과가 바뀐다", () => {
    const { result } = setup();
    act(() => result.current.press("/"));
    act(() => result.current.press("3"));
    expect(result.current.expression).toBe("36,000 ÷ 3");
    expect(result.current.result.amount).toBe(12000);
  });

  it("←는 한 글자, C는 식 전체를 지운다", () => {
    const { result } = setup();
    act(() => result.current.press("backspace"));
    expect(result.current.expression).toBe("3,600");
    act(() => result.current.press("clear"));
    expect(result.current.expression).toBe("");
  });

  it("끝전 처리를 바꾸면 결과에 적용한다", () => {
    const { result } = setup({ open: true, amount: "100000", content: "" });
    act(() => result.current.press("/"));
    act(() => result.current.press("3"));
    act(() => result.current.setUnit(10));
    act(() => result.current.setDirection("up"));
    expect(result.current.result.amount).toBe(33340);
  });

  it("다시 열면 처음부터 시작한다", () => {
    const { result, rerender } = setup();
    act(() => result.current.press("/"));
    act(() => result.current.setUnit(100));
    act(() => result.current.setRecord(false));
    rerender({ open: false, amount: "36000", content: "" });
    rerender({ open: true, amount: "500", content: "" });
    expect(result.current.expression).toBe("500");
    expect(result.current.rounding.unit).toBe(1);
    expect(result.current.record).toBe(true);
  });

  it("[적용]: 금액과 계산식을 붙인 내용을 돌려준다", () => {
    const { result } = setup({ open: true, amount: "36000", content: "점심" });
    act(() => result.current.press("/"));
    act(() => result.current.press("3"));
    expect(result.current.apply()).toEqual({
      amount: 12000,
      content: "점심\n36,000 ÷ 3 = 12,000",
    });
  });

  it("[적용]: 기록 체크를 끄면 금액만 돌려준다", () => {
    const { result } = setup();
    act(() => result.current.setRecord(false));
    expect(result.current.apply()).toEqual({ amount: 36000 });
  });

  it("내용이 넘치면 미리 알리고 [적용]은 금액만 돌려준다", () => {
    const { result } = setup({
      open: true,
      amount: "36000",
      content: "가".repeat(195),
    });
    expect(result.current.notice).toBe(CALCULATOR_TEXTS.contentOverflow);
    expect(result.current.apply()).toEqual({ amount: 36000 });
  });

  it("기록 체크를 끄면 넘침 안내도 없다", () => {
    const { result } = setup({
      open: true,
      amount: "36000",
      content: "가".repeat(195),
    });
    act(() => result.current.setRecord(false));
    expect(result.current.notice).toBeNull();
  });

  it("적용할 수 없는 식이면 null이다", () => {
    const { result } = setup({ open: true, amount: "", content: "" });
    expect(result.current.apply()).toBeNull();
  });
});
