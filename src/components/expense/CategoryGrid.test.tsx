import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CategoryGrid from "@/components/expense/CategoryGrid";

describe("CategoryGrid (화면 명세 SC-06 카테고리, 토큰 5-3)", () => {
  it("카테고리 10개를 순서대로 보여 준다", () => {
    render(<CategoryGrid id="category" value={null} onChange={vi.fn()} />);
    const group = screen.getByRole("group", { name: "카테고리" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual([
      "식비",
      "가전",
      "교통",
      "의료",
      "의류",
      "미용",
      "문화",
      "교육",
      "생활",
      "기타",
    ]);
  });

  it("누르면 그 카테고리를 고르고, 고른 칸은 선택 상태로 보인다", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CategoryGrid id="category" value={null} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "교통" }));
    expect(onChange).toHaveBeenCalledWith("TRANSPORT");

    rerender(
      <CategoryGrid id="category" value="TRANSPORT" onChange={onChange} />,
    );
    expect(screen.getByRole("button", { name: "교통" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "식비" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("고른 칸을 다시 눌러도 풀리지 않는다", async () => {
    const onChange = vi.fn();
    render(<CategoryGrid id="category" value="FOOD" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "식비" }));
    expect(onChange).toHaveBeenCalledWith("FOOD");
  });

  it("오류가 있으면 격자 아래에 문구를 보여 주고 격자에 잇는다", () => {
    render(
      <CategoryGrid
        id="category"
        value={null}
        onChange={vi.fn()}
        error="카테고리를 선택해 주세요."
      />,
    );
    expect(
      screen.getByRole("group", { name: "카테고리" }),
    ).toHaveAccessibleDescription("카테고리를 선택해 주세요.");
  });

  it("id는 첫 칸에 붙는다 (오류 칸으로 포커스를 옮길 때 쓴다)", () => {
    render(<CategoryGrid id="category" value={null} onChange={vi.fn()} />);
    expect(document.getElementById("category")).toHaveTextContent("식비");
  });
});
