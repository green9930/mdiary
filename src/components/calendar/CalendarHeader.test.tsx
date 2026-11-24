import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CalendarHeader from "@/components/calendar/CalendarHeader";

const handlers = () => ({
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onToday: vi.fn(),
  onOpenPicker: vi.fn(),
});

const renderHeader = (
  props: Partial<{
    month: string;
    total: number | undefined;
    canPrev: boolean;
    canNext: boolean;
    showToday: boolean;
  }> = {},
  on = handlers(),
) => {
  render(
    <CalendarHeader
      month="2026-10"
      total={1234500}
      canPrev
      canNext
      showToday={false}
      {...props}
      {...on}
    />,
  );
  return on;
};

describe("CalendarHeader (화면 명세 SC-03 헤더)", () => {
  it("연·월과 월 합계를 보여준다", () => {
    renderHeader();
    expect(
      screen.getByRole("button", { name: "2026년 10월 연·월 선택" }),
    ).toHaveTextContent("2026년 10월");
    expect(screen.getByText("Total.")).toBeInTheDocument();
    expect(screen.getByText("1,234,500원")).toBeInTheDocument();
  });

  it("합계가 0원이면 0원을 보여준다", () => {
    renderHeader({ total: 0 });
    expect(screen.getByText("0원")).toBeInTheDocument();
  });

  it("합계를 불러오는 중이면 금액 자리에 스켈레톤을 둔다", () => {
    renderHeader({ total: undefined });
    expect(screen.queryByText(/원$/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "불러오는 중" }),
    ).toBeInTheDocument();
  });

  it("버튼이 각 동작을 부른다", async () => {
    const on = renderHeader({ showToday: true });
    await userEvent.click(
      screen.getByRole("button", { name: "2026년 10월 연·월 선택" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "이전 달" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 달" }));
    await userEvent.click(screen.getByRole("button", { name: "오늘" }));
    expect(on.onOpenPicker).toHaveBeenCalledOnce();
    expect(on.onPrev).toHaveBeenCalledOnce();
    expect(on.onNext).toHaveBeenCalledOnce();
    expect(on.onToday).toHaveBeenCalledOnce();
  });

  it("[오늘]은 이번 달이 아닐 때만 보인다", () => {
    renderHeader({ showToday: false });
    expect(
      screen.queryByRole("button", { name: "오늘" }),
    ).not.toBeInTheDocument();
  });

  it("범위 끝에서는 이전·다음 달 버튼을 막는다", () => {
    renderHeader({ canPrev: false, canNext: false });
    expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 달" })).toBeDisabled();
  });
});
