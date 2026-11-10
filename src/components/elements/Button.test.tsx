import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Button from "@/components/elements/Button";

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

  it("text 버튼은 비활성이어도 면 없이 밑줄 글자이고, 글자색만 바뀐다", () => {
    render(
      <Button variant="text" disabled>
        개인정보처리방침
      </Button>,
    );
    const button = screen.getByRole("button", { name: "개인정보처리방침" });
    expect(button).toHaveClass("underline", "text-on-disabled");
    expect(button).not.toHaveClass("bg-disabled", "text-text01");
  });

  it("variant로 비활성 모양만 입히면 모양은 비활성이지만 눌린다", async () => {
    const onClick = vi.fn();
    render(
      <>
        <Button variant="disabled" onClick={onClick}>
          저장
        </Button>
        <Button variant="textDisabled" disabled>
          서비스 안내
        </Button>
      </>,
    );
    const save = screen.getByRole("button", { name: "저장" });
    expect(save).toHaveClass("bg-disabled", "text-on-disabled");
    expect(save).toBeEnabled();
    await userEvent.click(save);
    expect(onClick).toHaveBeenCalledOnce();

    const link = screen.getByRole("button", { name: "서비스 안내" });
    expect(link).toHaveClass("underline", "text-on-disabled");
    expect(link).not.toHaveClass("bg-disabled");
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

  it("크기 lg는 높이 48에 폭 전체, md·sm은 누르는 영역을 44로 넓힌다", () => {
    render(
      <>
        <Button size="lg">저장</Button>
        <Button size="md">취소</Button>
        <Button size="sm">오늘</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "저장" })).toHaveClass(
      "h-12",
      "w-full",
    );
    expect(screen.getByRole("button", { name: "취소" })).toHaveClass(
      "h-10",
      "touch-44",
    );
    expect(screen.getByRole("button", { name: "오늘" })).toHaveClass(
      "h-8",
      "touch-44",
    );
  });
});
