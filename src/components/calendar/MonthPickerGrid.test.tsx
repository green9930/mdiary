import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import MonthPickerGrid from "@/components/calendar/MonthPickerGrid";

const renderGrid = ({ selected = "2026-08", onSelect = vi.fn() } = {}) =>
  render(
    <MonthPickerGrid
      selected={selected}
      currentMonth="2026-11"
      onSelect={onSelect}
    />,
  );

describe("MonthPickerGrid (화면 명세 SC-03 연·월 선택)", () => {
  it("고른 달의 해와 1~12월을 그린다", () => {
    renderGrid();
    expect(screen.getByText("2026년")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button", { name: /^\d+월$/ })
        .map((b) => b.textContent),
    ).toEqual(Array.from({ length: 12 }, (_, i) => `${i + 1}월`));
  });

  it("지금 보고 있는 달은 선택, 이번 달은 현재로 알린다", () => {
    renderGrid();
    expect(screen.getByRole("button", { name: "8월" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "11월" })).toHaveAttribute(
      "aria-current",
      "date",
    );
  });

  it("월을 누르면 그 해의 그 달을 고른다", async () => {
    const onSelect = vi.fn();
    renderGrid({ onSelect });
    await userEvent.click(screen.getByRole("button", { name: "이전 해" }));
    await userEvent.click(screen.getByRole("button", { name: "3월" }));
    expect(onSelect).toHaveBeenCalledWith("2025-03");
  });

  it("다른 해에서는 지금 보고 있는 달을 선택으로 그리지 않는다", async () => {
    renderGrid();
    await userEvent.click(screen.getByRole("button", { name: "다음 해" }));
    expect(screen.getByText("2027년")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8월" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("선택 가능 연도의 처음 2020년에서 이전 해로 갈 수 없다", () => {
    renderGrid({ selected: "2020-05" });
    expect(screen.getByRole("button", { name: "이전 해" })).toBeDisabled();
  });

  it("기록이 없는 과거 해로도 옮길 수 있다", async () => {
    renderGrid({ selected: "2021-05" });
    await userEvent.click(screen.getByRole("button", { name: "이전 해" }));
    expect(screen.getByText("2020년")).toBeInTheDocument();
  });

  it("기술 상한 2099년에서 다음 해로 갈 수 없다", () => {
    renderGrid({ selected: "2099-01" });
    expect(screen.getByRole("button", { name: "다음 해" })).toBeDisabled();
  });
});

describe("MonthPickerGrid 기간 선택 (와이어프레임 SC-04 ⑦ ⑫)", () => {
  it("기간 안의 다른 달은 옅게 채운다", () => {
    render(
      <MonthPickerGrid
        selected="2026-08"
        currentMonth="2026-11"
        range={{ from: "2026-08", to: "2026-10" }}
        onSelect={vi.fn()}
      />,
    );
    const inRange = screen
      .getAllByRole("button", { name: /^\d+월$/ })
      .filter((button) => button.dataset.inRange === "true")
      .map((button) => button.textContent);
    expect(inRange).toEqual(["9월", "10월"]);
  });

  it("고를 수 없는 달은 비활성", () => {
    render(
      <MonthPickerGrid
        selected="2026-10"
        currentMonth="2026-11"
        isDisabled={(month) => month < "2026-08"}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "7월" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "8월" })).toBeEnabled();
  });
});
