import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CalculatorSheet from "@/components/expense/CalculatorSheet";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import {
  ARIA_LABELS,
  BTN_TEXTS,
  CALCULATOR_ERRORS,
  CALCULATOR_TEXTS,
} from "@/shared/sharedConstants";

// jsdom의 <dialog>는 접근성 트리에서 open 여부를 따르지 않으므로 hidden까지 찾는다
const key = (name: string) =>
  screen.getByRole("button", { name, hidden: true });

const setup = (amount = "36000", content = "") => {
  const onApply = vi.fn();
  const onClose = vi.fn();
  render(
    <CalculatorSheet
      open
      amount={amount}
      content={content}
      onApply={onApply}
      onClose={onClose}
    />,
  );
  return { onApply, onClose, user: userEvent.setup() };
};

describe("CalculatorSheet (화면 명세 SC-07)", () => {
  beforeEach(() => resetHistoryLayers());

  it("금액 값으로 시작하고, 키패드로 식을 만들어 [적용]한다", async () => {
    const { onApply, user } = setup();
    expect(screen.getByText("36,000")).toBeInTheDocument();

    await user.click(key("+"));
    await user.click(key("4"));
    await user.click(key("5"));
    await user.click(key("00"));
    expect(screen.getByText("36,000 + 4,500")).toBeInTheDocument();
    expect(screen.getByText("= 40,500")).toBeInTheDocument();

    await user.click(key(BTN_TEXTS.apply));
    expect(onApply).toHaveBeenCalledWith({
      amount: 40500,
      content: "36,000 + 4,500 = 40,500",
    });
  });

  it("←·C로 지운다", async () => {
    const { user } = setup();
    await user.click(key(ARIA_LABELS.backspace));
    expect(screen.getByText("3,600")).toBeInTheDocument();
    await user.click(key(ARIA_LABELS.clear));
    expect(screen.queryByText("3,600")).not.toBeInTheDocument();
    expect(key(BTN_TEXTS.apply)).toBeDisabled();
  });

  it("끝전 처리는 나누기가 있을 때만 보이고 결과에 적용한다", async () => {
    const { onApply, user } = setup("100000");
    expect(
      screen.queryByText(CALCULATOR_TEXTS.rounding),
    ).not.toBeInTheDocument();

    await user.click(key("÷"));
    await user.click(key("3"));
    expect(screen.getByText(CALCULATOR_TEXTS.rounding)).toBeInTheDocument();
    expect(screen.getByText("33,333.33")).toBeInTheDocument();

    await user.click(
      screen.getByRole("radio", {
        name: CALCULATOR_TEXTS.unit(10),
        hidden: true,
      }),
    );
    await user.click(
      screen.getByRole("radio", {
        name: CALCULATOR_TEXTS.roundUp,
        hidden: true,
      }),
    );
    expect(screen.getByText("= 33,340")).toBeInTheDocument();

    await user.click(key(BTN_TEXTS.apply));
    expect(onApply).toHaveBeenCalledWith({
      amount: 33340,
      content: `100,000 ÷ 3 = 33,340 ${CALCULATOR_TEXTS.roundingNote(10, true)}`,
    });
  });

  it("적용할 수 없으면 이유를 보이고 [적용]을 막는다", async () => {
    const { user } = setup("5000");
    await user.click(key("−"));
    await user.click(key("8"));
    await user.click(key("00"));
    await user.click(key("0"));
    expect(screen.getByText(CALCULATOR_ERRORS.belowMin)).toBeInTheDocument();
    expect(key(BTN_TEXTS.apply)).toBeDisabled();
  });

  it("기록 체크를 끄면 금액만 넣는다", async () => {
    const { onApply, user } = setup();
    await user.click(
      screen.getByRole("checkbox", {
        name: CALCULATOR_TEXTS.recordFormula,
        hidden: true,
      }),
    );
    await user.click(key(BTN_TEXTS.apply));
    expect(onApply).toHaveBeenCalledWith({ amount: 36000 });
  });

  it("내용이 넘치면 미리 알리고, [적용]은 금액만 넣는다", async () => {
    const { onApply, user } = setup("36000", "가".repeat(195));
    expect(
      screen.getByText(CALCULATOR_TEXTS.contentOverflow),
    ).toBeInTheDocument();
    await user.click(key(BTN_TEXTS.apply));
    expect(onApply).toHaveBeenCalledWith({ amount: 36000 });
  });

  it("물리 키보드로도 입력하고 Enter로 적용한다", async () => {
    const { onApply, user } = setup("");
    await user.keyboard("1200/4{Backspace}3");
    expect(screen.getByText("1,200 ÷ 3")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onApply).toHaveBeenCalledWith({
      amount: 400,
      content: "1,200 ÷ 3 = 400",
    });
  });
});
