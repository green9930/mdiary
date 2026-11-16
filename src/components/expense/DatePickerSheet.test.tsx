import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DatePickerSheet from "@/components/expense/DatePickerSheet";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";

const setup = (value = "2026-10-18") => {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  render(
    <DatePickerSheet
      open
      value={value}
      today="2026-10-21"
      onSelect={onSelect}
      onClose={onClose}
    />,
  );
  return { onSelect, onClose };
};

const button = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

describe("DatePickerSheet (와이어프레임 SC-06 ⑧)", () => {
  beforeEach(() => resetHistoryLayers());

  it("지금 날짜가 있는 달을 선택된 채로 연다", () => {
    setup();
    expect(screen.getByText("2026년 10월")).toBeInTheDocument();
    expect(button("2026년 10월 18일 (일)")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("날짜를 고르고 [선택]을 누르면 그 날짜로 정하고 닫는다", async () => {
    const { onSelect, onClose } = setup();
    await userEvent.click(button("2026년 10월 25일 (일)"));
    await userEvent.click(button("선택"));
    expect(onSelect).toHaveBeenCalledWith("2026-10-25");
    expect(onClose).toHaveBeenCalled();
  });

  it("날짜만 고르고 닫으면 정하지 않는다", async () => {
    const { onSelect } = setup();
    await userEvent.click(button("2026년 10월 25일 (일)"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("‹ ›로 달을 옮긴다", async () => {
    setup();
    await userEvent.click(button("다음 달"));
    expect(screen.getByText("2026년 11월")).toBeInTheDocument();
    await userEvent.click(button("이전 달"));
    await userEvent.click(button("이전 달"));
    expect(screen.getByText("2026년 9월")).toBeInTheDocument();
  });

  it("앞뒤 달 날짜를 고르면 그 달로 옮긴다", async () => {
    setup();
    await userEvent.click(button("2026년 11월 2일 (월)"));
    expect(screen.getByText("2026년 11월")).toBeInTheDocument();
  });

  it("2099년 12월에서는 다음 달로 가지 않는다 (입력 검증용 기술 상한)", () => {
    setup("2099-12-01");
    expect(button("다음 달")).toBeDisabled();
  });
});
