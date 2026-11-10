import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  type ComponentProps,
  type JSXElementConstructor,
  useState,
} from "react";
import { describe, expect, it } from "vitest";

import NumberInput from "@/components/elements/NumberInput";
import TextArea from "@/components/elements/TextArea";
import TextInput from "@/components/elements/TextInput";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 아무 컴포넌트나 받는다
type ControlledType<T extends JSXElementConstructor<any>> = Omit<
  ComponentProps<T>,
  "value" | "onValueChange"
> & { initial?: string };

const ControlledText = ({
  initial = "",
  ...props
}: ControlledType<typeof TextInput>) => {
  const [value, setValue] = useState(initial);
  return <TextInput value={value} onValueChange={setValue} {...props} />;
};

const ControlledArea = ({
  initial = "",
  ...props
}: ControlledType<typeof TextArea>) => {
  const [value, setValue] = useState(initial);
  return <TextArea value={value} onValueChange={setValue} {...props} />;
};

const ControlledNumber = ({
  initial = "",
  ...props
}: ControlledType<typeof NumberInput>) => {
  const [value, setValue] = useState(initial);
  return <NumberInput value={value} onValueChange={setValue} {...props} />;
};

describe("TextInput (CG ②③)", () => {
  it("라벨로 입력칸을 찾을 수 있다", () => {
    render(<ControlledText label="제목" />);
    expect(screen.getByLabelText("제목")).toBeInTheDocument();
  });

  it("한도에 닿으면 더 입력되지 않는다", async () => {
    render(<ControlledText label="제목" maxLength={3} />);
    const input = screen.getByLabelText("제목");
    await userEvent.type(input, "가나다라마");
    expect(input).toHaveValue("가나다");
  });

  it("붙여넣기는 한도까지만 넣는다", async () => {
    render(<ControlledText label="제목" maxLength={5} initial="쿠팡" />);
    const input = screen.getByLabelText("제목");
    await userEvent.click(input);
    await userEvent.paste("생필품 주문");
    expect(input).toHaveValue("쿠팡생필품");
  });

  it("카운터는 이모지를 1자로 세고, 한도에 닿으면 강조한다", async () => {
    render(<ControlledText label="제목" maxLength={3} initial="👨‍👩‍👧" />);
    expect(screen.getByText("1/3")).toHaveClass("text-text03");
    await userEvent.type(screen.getByLabelText("제목"), "가나");
    expect(screen.getByText("3/3")).toHaveClass("text-text02");
  });

  it("오류가 있으면 아래에 문구를 보여 주고 입력칸과 잇는다", () => {
    render(<ControlledText label="제목" error="제목을 입력해 주세요." />);
    const input = screen.getByLabelText("제목");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("제목을 입력해 주세요.");
  });

  it("오류가 없으면 aria-invalid를 두지 않는다", () => {
    render(<ControlledText label="제목" />);
    expect(screen.getByLabelText("제목")).not.toHaveAttribute("aria-invalid");
  });

  it("단위를 입력칸 안에 보여 준다", () => {
    render(<ControlledText label="금액" unit="원" />);
    expect(screen.getByText("원")).toBeInTheDocument();
  });

  it("비활성이면 입력할 수 없다", async () => {
    render(<ControlledText label="제목" disabled initial="월세" />);
    const input = screen.getByLabelText("제목");
    expect(input).toBeDisabled();
    await userEvent.type(input, "가");
    expect(input).toHaveValue("월세");
  });
});

describe("TextArea (토큰 5-2)", () => {
  it("줄바꿈도 1자로 세어 한도에서 막는다", async () => {
    render(<ControlledArea label="내용" maxLength={4} />);
    const area = screen.getByLabelText("내용");
    await userEvent.type(area, "가{Enter}나다라");
    expect(area).toHaveValue("가\n나다");
    expect(screen.getByText("4/4")).toBeInTheDocument();
  });

  it("3줄 높이로 시작한다", () => {
    render(<ControlledArea label="내용" />);
    expect(screen.getByLabelText("내용")).toHaveAttribute("rows", "3");
  });
});

describe("NumberInput (CG ⑤)", () => {
  it("숫자 키패드를 띄운다", () => {
    render(<ControlledNumber label="기간" unit="개월" />);
    expect(screen.getByLabelText("기간")).toHaveAttribute(
      "inputMode",
      "numeric",
    );
  });

  it("숫자만 받고 최대 2자리다", async () => {
    render(<ControlledNumber label="기간" unit="개월" />);
    const input = screen.getByLabelText("기간");
    await userEvent.type(input, "1a2b3");
    expect(input).toHaveValue("12");
  });

  it("맨 앞 0을 지운다", async () => {
    render(<ControlledNumber label="기간" unit="개월" />);
    const input = screen.getByLabelText("기간");
    await userEvent.type(input, "07");
    expect(input).toHaveValue("7");
  });

  it("붙여넣기는 숫자만 골라 2자리에서 자른다", async () => {
    render(<ControlledNumber label="회차" unit="회" />);
    const input = screen.getByLabelText("회차");
    await userEvent.click(input);
    await userEvent.paste("12개월abc345");
    expect(input).toHaveValue("12");
  });

  it("단위를 고정으로 보여 주고 오류 문구를 잇는다", () => {
    render(
      <ControlledNumber
        label="회차"
        unit="회"
        initial="1"
        error="2부터 입력할 수 있습니다."
      />,
    );
    expect(screen.getByText("회")).toBeInTheDocument();
    expect(screen.getByLabelText("회차")).toHaveAccessibleDescription(
      "2부터 입력할 수 있습니다.",
    );
  });
});
