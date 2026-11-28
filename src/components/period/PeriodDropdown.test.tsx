import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PeriodDropdown from "@/components/period/PeriodDropdown";

const setup = (period: { from: string; to: string }) => {
  const onSelect = vi.fn();
  render(
    <PeriodDropdown period={period} thisMonth="2026-10" onSelect={onSelect} />,
  );
  return { onSelect };
};

const options = () =>
  screen.getAllByRole("option").map((option) => ({
    label: option.textContent,
    selected: option.getAttribute("aria-selected") === "true",
  }));

describe("PeriodDropdown (화면 명세 SC-04 기간 드롭다운, 와이어프레임 ① ⑨)", () => {
  it("빠른 선택 4개를 펼치고 지금 기간을 선택으로 보여준다", async () => {
    setup({ from: "2026-08", to: "2026-10" });
    await userEvent.click(
      screen.getByRole("button", { name: "기간: 최근 3개월" }),
    );
    expect(options()).toEqual([
      { label: "이번 달", selected: false },
      { label: "최근 3개월", selected: true },
      { label: "최근 6개월", selected: false },
      { label: "최근 1년", selected: false },
    ]);
  });

  it("고르면 바로 그 기간을 적용한다", async () => {
    const { onSelect } = setup({ from: "2026-10", to: "2026-10" });
    await userEvent.click(
      screen.getByRole("button", { name: "기간: 이번 달" }),
    );
    await userEvent.click(screen.getByRole("option", { name: "최근 1년" }));
    expect(onSelect).toHaveBeenCalledWith({ from: "2025-11", to: "2026-10" });
  });

  it("직접 정한 기간이면 라벨에 기간을 보이고, 메뉴 맨 위에 선택으로 둔다", async () => {
    const { onSelect } = setup({ from: "2025-03", to: "2026-02" });
    await userEvent.click(
      screen.getByRole("button", { name: "기간: 2025년 3월 ~ 2026년 2월" }),
    );
    expect(options()[0]).toEqual({
      label: "2025년 3월 ~ 2026년 2월",
      selected: true,
    });
    expect(options()).toHaveLength(5);

    await userEvent.click(
      screen.getByRole("option", { name: "2025년 3월 ~ 2026년 2월" }),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});
