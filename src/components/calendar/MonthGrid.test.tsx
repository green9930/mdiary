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

describe("MonthGrid 칸 금액 (화면 명세 SC-03 칸, 공통 정책값 달력 칸 축약 표시)", () => {
  const renderWithTotals = (totals: Record<string, number>) =>
    render(
      <MonthGrid
        month="2026-10"
        selected="2026-10-18"
        today="2026-10-21"
        totals={totals}
        onSelect={vi.fn()}
      />,
    );

  it("그날 합계를 날짜 아래에 보여주고 금액까지 읽어 준다", () => {
    renderWithTotals({ "2026-10-18": 21300 });
    const day = screen.getByRole("button", {
      name: "2026년 10월 18일 (일) 21,300원",
    });
    expect(day).toHaveTextContent("1821,300");
  });

  it("넘치는 금액은 줄여서 보여준다", () => {
    renderWithTotals({ "2026-10-10": 1_080_000 });
    expect(
      screen.getByRole("button", { name: "2026년 10월 10일 (토) 1,080,000원" }),
    ).toHaveTextContent("10108만");
  });

  it("합계가 없는 날은 비워 둔다", () => {
    renderWithTotals({});
    expect(
      screen.getByRole("button", { name: "2026년 10월 18일 (일)" }),
    ).toHaveTextContent(/^18$/);
  });

  it("앞뒤 달 날짜에는 금액을 보여주지 않는다", () => {
    renderWithTotals({ "2026-11-02": 5000 });
    expect(
      screen.getByRole("button", { name: "2026년 11월 2일 (월)" }),
    ).toHaveTextContent(/^2$/);
  });
});

describe("MonthGrid 선택 가능 범위 (화면 명세 공통 정책값 선택 가능 연도)", () => {
  it("2020-01-01보다 앞선 날짜는 누를 수 없다", () => {
    render(
      <MonthGrid
        month="2020-01"
        selected="2020-01-01"
        today="2026-10-21"
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "2019년 12월 31일 (화)" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "2020년 1월 1일 (수)" }),
    ).toBeEnabled();
  });

  it("2099-12-31보다 뒤 날짜는 누를 수 없다", () => {
    render(
      <MonthGrid
        month="2099-12"
        selected="2099-12-01"
        today="2026-10-21"
        onSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "2099년 12월 31일 (목)" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "2100년 1월 1일 (금)" }),
    ).toBeDisabled();
  });
});
