import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PeriodPickerSheet from "@/components/period/PeriodPickerSheet";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";

const setup = (period = { from: "2026-08", to: "2026-10" }) => {
  const onApply = vi.fn();
  const onClose = vi.fn();
  render(
    <PeriodPickerSheet
      open
      period={period}
      thisMonth="2026-10"
      onApply={onApply}
      onClose={onClose}
    />,
  );
  return { onApply, onClose };
};

const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });
const field = (name: RegExp) =>
  screen.getByRole("radio", { name, hidden: true });

describe("PeriodPickerSheet (화면 명세 SC-04 기간 선택 바텀시트, 와이어프레임 ⑦⑧)", () => {
  beforeEach(() => resetHistoryLayers());

  it("열 때는 시작 칸이 선택돼 있고 시작 달을 고른 채로 그린다", () => {
    setup();
    expect(field(/^시작 2026년 8월$/)).toBeChecked();
    expect(field(/^끝 2026년 10월$/)).not.toBeChecked();
    expect(button("8월")).toHaveAttribute("aria-pressed", "true");
  });

  it("시작을 끝보다 뒤로 고르면 끝을 시작과 같게 맞춘다", async () => {
    setup();
    await userEvent.click(button("12월"));
    expect(field(/^시작 2026년 12월$/)).toBeChecked();
    expect(field(/^끝 2026년 12월$/)).toBeInTheDocument();
  });

  it("끝을 고르는 동안 시작보다 앞선 달은 비활성", async () => {
    setup();
    await userEvent.click(field(/^끝/));
    expect(button("7월")).toBeDisabled();
    expect(button("8월")).toBeEnabled();
    await userEvent.click(button("11월"));
    expect(field(/^끝 2026년 11월$/)).toBeChecked();
  });

  it("[적용]은 고른 기간으로 정하고 닫는다", async () => {
    const { onApply, onClose } = setup();
    await userEvent.click(button("5월"));
    await userEvent.click(button("적용"));
    expect(onApply).toHaveBeenCalledWith({ from: "2026-05", to: "2026-10" });
    expect(onClose).toHaveBeenCalled();
  });

  it("60개월을 넘으면 [적용]이 비활성이고 이유를 보여준다", async () => {
    setup({ from: "2021-11", to: "2026-10" });
    expect(button("적용")).toBeEnabled();
    expect(
      screen.queryByText("최대 5년까지 조회할 수 있습니다."),
    ).not.toBeInTheDocument();

    await userEvent.click(button("이전 해"));
    await userEvent.click(button("10월"));

    expect(button("적용")).toBeDisabled();
    expect(
      screen.getByText("최대 5년까지 조회할 수 있습니다."),
    ).toBeInTheDocument();
  });
});
