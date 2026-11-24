import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DayExpenseList from "@/components/calendar/DayExpenseList";
import type { ExpenseListItem } from "@/types/expenseTypes";

const items: ExpenseListItem[] = [
  {
    id: "e1",
    date: "2026-10-18",
    title: "점심 김밥",
    category: "FOOD",
    amount: 8000,
  },
  {
    id: "e2",
    date: "2026-10-18",
    title: "넷플릭스",
    category: "LIVING",
    amount: 13300,
    series: { type: "RECURRING", seq: 2, totalCount: null },
  },
  {
    id: "e3",
    date: "2026-10-18",
    title: "아이패드",
    category: "APPLIANCE",
    amount: 100000,
    series: { type: "INSTALLMENT", seq: 3, totalCount: 12 },
  },
];

const renderList = (
  list: ExpenseListItem[],
  onAdd = vi.fn(),
  onSelect = vi.fn(),
) =>
  render(
    <DayExpenseList
      date="2026-10-18"
      today="2026-11-17"
      items={list}
      onAdd={onAdd}
      onSelect={onSelect}
    />,
  );

describe("DayExpenseList (화면 명세 SC-03 선택한 날짜의 목록)", () => {
  it("요약에 날짜·건수·합계를 보여준다", () => {
    renderList(items);
    expect(screen.getByText("10월 18일 (일)")).toBeInTheDocument();
    expect(screen.getByText("3건 · 121,300원")).toBeInTheDocument();
  });

  it("다른 해의 날짜는 연도를 붙인다", () => {
    render(
      <DayExpenseList
        date="2025-10-18"
        today="2026-11-17"
        items={[]}
        onAdd={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText("2025년 10월 18일 (토)")).toBeInTheDocument();
  });

  it("받은 순서대로 제목과 금액을 보여준다", () => {
    renderList(items);
    const rows = screen.getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      "점심 김밥8,000원",
      "넷플릭스정기13,300원",
      "아이패드할부 3/12100,000원",
    ]);
  });

  it("항목을 누르면 그 기록을 고른다 (상세 시트)", async () => {
    const onSelect = vi.fn();
    renderList(items, vi.fn(), onSelect);

    await userEvent.click(screen.getByRole("button", { name: /넷플릭스/ }));

    expect(onSelect).toHaveBeenCalledWith("e2");
  });

  it("기록이 없으면 0건과 빈 상태, [기록 추가하기]를 보여준다", async () => {
    const onAdd = vi.fn();
    renderList([], onAdd);
    expect(screen.getByText("0건")).toBeInTheDocument();
    expect(screen.getByText("기록이 없습니다.")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "기록 추가하기" }),
    );
    expect(onAdd).toHaveBeenCalledOnce();
  });
});
