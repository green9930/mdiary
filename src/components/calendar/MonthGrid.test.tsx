import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import MonthGrid from "@/components/calendar/MonthGrid";

const renderGrid = (onSelect = vi.fn()) =>
  render(
    <MonthGrid
      month="2026-10"
      selected="2026-10-18"
      today="2026-10-21"
      onSelect={onSelect}
    />,
  );

describe("MonthGrid (화면 명세 SC-03 달력, 토큰 5-5)", () => {
  it("요일 줄과 6줄 42칸을 그린다", () => {
    renderGrid();
    expect(
      screen.getAllByRole("columnheader").map((h) => h.textContent),
    ).toEqual(["일", "월", "화", "수", "목", "금", "토"]);
    expect(screen.getAllByRole("row")).toHaveLength(7);
    expect(screen.getAllByRole("button")).toHaveLength(42);
  });

  it("앞뒤 달 날짜도 그린다", () => {
    renderGrid();
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]!).getAllByRole("button")[0]).toHaveAccessibleName(
      "2026년 9월 27일 (일)",
    );
    expect(within(rows[6]!).getAllByRole("button")[6]).toHaveAccessibleName(
      "2026년 11월 7일 (토)",
    );
  });

  it("선택한 날짜와 오늘을 알린다", () => {
    renderGrid();
    expect(
      screen.getByRole("button", { name: "2026년 10월 18일 (일)" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "2026년 10월 21일 (수)" }),
    ).toHaveAttribute("aria-current", "date");
  });

  it("날짜를 누르면 그 날짜를 고른다", async () => {
    const onSelect = vi.fn();
    renderGrid(onSelect);
    await userEvent.click(
      screen.getByRole("button", { name: "2026년 11월 2일 (월)" }),
    );
    expect(onSelect).toHaveBeenCalledWith("2026-11-02");
  });

  it("일요일은 빨강, 토요일은 회색, 앞뒤 달은 흐리게 그린다", () => {
    renderGrid();
    expect(screen.getAllByText("4", { selector: "button *" })[0]).toHaveClass(
      "text-danger-text",
    );
    expect(screen.getByText("10", { selector: "button *" })).toHaveClass(
      "text-text02",
    );
    expect(screen.getAllByText("27", { selector: "button *" })[0]).toHaveClass(
      "text-text03",
    );
  });
});
