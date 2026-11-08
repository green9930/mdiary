import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Button from "./Button";

describe("Button (CG ①, 토큰 5-1)", () => {
  it("종류마다 면·글자 토큰을 쓴다", () => {
    render(
      <>
        <Button variant="primary">저장</Button>
        <Button variant="danger">삭제</Button>
        <Button variant="line">취소</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "저장" })).toHaveClass(
      "bg-primary",
      "text-on-primary",
    );
    expect(screen.getByRole("button", { name: "삭제" })).toHaveClass(
      "bg-danger",
      "text-on-danger",
    );
    expect(screen.getByRole("button", { name: "취소" })).toHaveClass(
      "border-line-strong",
      "bg-bg",
    );
  });

  it("기본은 submit이 아니라 button이다 (폼 안에서 의도치 않은 제출 방지)", () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("비활성이면 종류와 상관없이 disabled 모양이고 누를 수 없다", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="danger" disabled onClick={onClick}>
        삭제
      </Button>,
    );
    const button = screen.getByRole("button", { name: "삭제" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-disabled", "text-on-disabled");
    expect(button).not.toHaveClass("bg-danger");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("요청 중이면 스피너를 보여 주고 누를 수 없다. 색은 그대로다", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        저장
      </Button>,
    );
    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveClass("bg-primary");
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("크기 L은 높이 52에 폭 전체, S는 누르는 영역을 44로 넓힌다", () => {
    render(
      <>
        <Button size="l">저장</Button>
        <Button size="s">오늘</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "저장" })).toHaveClass(
      "h-13",
      "w-full",
    );
    expect(screen.getByRole("button", { name: "오늘" })).toHaveClass(
      "h-8",
      "touch-44",
    );
  });
});
