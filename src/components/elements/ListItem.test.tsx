import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Badge from "./Badge";
import ListItem from "./ListItem";

describe("ListItem (CG ⑨)", () => {
  it("제목·배지·보조 줄·금액을 보여 주고, 항목 전체가 누르는 영역이다", async () => {
    const onClick = vi.fn();
    render(
      <ListItem
        icon={<svg />}
        title="아이패드"
        badge={<Badge>할부 2/3</Badge>}
        subtitle="11.01"
        amount="100,000원"
        onClick={onClick}
      />,
    );
    const item = screen.getByRole("button", { name: /아이패드/ });
    expect(item).toHaveTextContent("할부 2/3");
    expect(item).toHaveTextContent("11.01");
    expect(item).toHaveTextContent("100,000원");
    await userEvent.click(screen.getByText("100,000원"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("제목만 말줄임하고 배지·금액은 줄이지 않는다", () => {
    render(
      <ListItem
        icon={<svg />}
        title="넷플릭스 스탠다드 요금제 월 구독료"
        badge={<Badge>정기</Badge>}
        amount="13,300원"
      />,
    );
    expect(screen.getByText("넷플릭스 스탠다드 요금제 월 구독료")).toHaveClass(
      "truncate",
    );
    expect(screen.getByText("정기")).toHaveClass("shrink-0");
    expect(screen.getByText("13,300원")).toHaveClass("shrink-0");
  });
});
