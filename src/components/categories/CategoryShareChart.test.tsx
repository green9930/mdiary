import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CategoryShareChart from "@/components/categories/CategoryShareChart";
import type { CategoryStats } from "@/types/expenseTypes";

const stats: CategoryStats = {
  total: 1234500,
  count: 42,
  categories: [
    { category: "LIVING", total: 519700, count: 10 },
    { category: "FOOD", total: 345700, count: 23 },
    { category: "MEDICAL", total: 900, count: 1 },
  ],
};

const setup = (selected: "FOOD" | null = null) => {
  const onSelect = vi.fn();
  render(
    <CategoryShareChart
      stats={stats}
      selected={selected}
      onSelect={onSelect}
    />,
  );
  return { onSelect };
};

const rows = () => screen.getAllByRole("button");
const row = (name: string) =>
  screen.getByRole("button", { name: new RegExp(`^${name}`) });

describe("CategoryShareChart (화면 명세 SC-04 비중 가로 막대 그래프, 와이어프레임 ③④)", () => {
  it("지출이 있는 카테고리를 받은 순서대로: 이름 · 비율 · 금액", () => {
    setup();
    expect(rows().map((row) => row.textContent)).toEqual([
      "생활42.1%519,700원",
      "식비28.0%345,700원",
      "의료<0.1%900원",
    ]);
  });

  it("막대 폭은 비중이다", () => {
    setup();
    expect(
      screen.getAllByTestId("share-bar").map((bar) => bar.style.width)[1],
    ).toBe(`${(345700 / 1234500) * 100}%`);
  });

  it("줄을 누르면 그 카테고리로 필터한다", async () => {
    const { onSelect } = setup();
    await userEvent.click(row("식비"));
    expect(onSelect).toHaveBeenCalledWith("FOOD");
  });

  it("선택된 줄은 눌린 상태이고, 다시 누르면 전체로 돌아간다", async () => {
    const { onSelect } = setup("FOOD");
    expect(row("식비")).toHaveAttribute("aria-pressed", "true");
    expect(row("생활")).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(row("식비"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
