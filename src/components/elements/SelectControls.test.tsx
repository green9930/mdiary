import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import Checkbox from "./Checkbox";
import Chip from "./Chip";
import Radio from "./Radio";
import Segment from "./Segment";

const REPEAT_OPTIONS = [
  { value: "none", label: "없음" },
  { value: "monthly", label: "정기지출" },
  { value: "installment", label: "할부" },
] as const;

interface RepeatSegmentProps {
  disabled?: boolean;
}

const RepeatSegment = ({ disabled = false }: RepeatSegmentProps) => {
  const [value, setValue] = useState<"none" | "monthly" | "installment">(
    "none",
  );
  return (
    <Segment
      aria-label="반복"
      options={REPEAT_OPTIONS}
      value={value}
      onValueChange={setValue}
      disabled={disabled}
    />
  );
};

describe("Segment (CG ④)", () => {
  it("항상 하나가 선택돼 있고, 다른 칸을 누르면 그 칸이 선택된다", async () => {
    render(<RepeatSegment />);
    expect(screen.getByRole("radio", { name: "없음" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "할부" }));
    expect(screen.getByRole("radio", { name: "할부" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "없음" })).not.toBeChecked();
  });

  it("선택된 칸을 다시 눌러도 선택이 풀리지 않는다", async () => {
    render(<RepeatSegment />);
    await userEvent.click(screen.getByRole("radio", { name: "없음" }));
    expect(screen.getByRole("radio", { name: "없음" })).toBeChecked();
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
  });

  it("비활성이면 바꿀 수 없다", async () => {
    render(<RepeatSegment disabled />);
    await userEvent.click(screen.getByRole("radio", { name: "할부" }));
    expect(screen.getByRole("radio", { name: "없음" })).toBeChecked();
  });
});

describe("Chip (토큰 5-3)", () => {
  it("선택 상태를 aria-pressed로 알린다", async () => {
    const onClick = vi.fn();
    render(
      <>
        <Chip selected>전체</Chip>
        <Chip selected={false} onClick={onClick}>
          식비
        </Chip>
      </>,
    );
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: "식비" }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe("Checkbox (CG ④)", () => {
  const Controlled = () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox checked={checked} onCheckedChange={setChecked}>
        계산식을 내용에 기록
      </Checkbox>
    );
  };

  it("라벨 글자를 눌러도 체크된다", async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByText("계산식을 내용에 기록"));
    expect(
      screen.getByRole("checkbox", { name: "계산식을 내용에 기록" }),
    ).toBeChecked();
  });

  it("비활성이면 바뀌지 않는다", async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} disabled>
        비활성
      </Checkbox>,
    );
    await userEvent.click(screen.getByText("비활성"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe("Radio (CG ④, SC-09)", () => {
  const Controlled = () => {
    const [value, setValue] = useState("this");
    return (
      <div role="radiogroup" aria-label="범위">
        <Radio
          name="scope"
          value="this"
          checked={value === "this"}
          onSelect={setValue}
        >
          이번 건만
        </Radio>
        <Radio
          name="scope"
          value="after"
          checked={value === "after"}
          onSelect={setValue}
        >
          이후 전체
        </Radio>
        <Radio
          name="scope"
          value="months"
          checked={value === "months"}
          onSelect={setValue}
          disabled
          hint="날짜를 뒤 달로 옮기면 고를 수 없습니다."
        >
          이 건부터 N개월
        </Radio>
      </div>
    );
  };

  it("라벨 글자를 눌러도 선택된다", async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByText("이후 전체"));
    expect(screen.getByRole("radio", { name: "이후 전체" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "이번 건만" })).not.toBeChecked();
  });

  it("비활성이면 고를 수 없고 안내 문구를 보여 준다", async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByText("이 건부터 N개월"));
    expect(
      screen.getByRole("radio", { name: /이 건부터 N개월/ }),
    ).toBeDisabled();
    expect(screen.getByRole("radio", { name: "이번 건만" })).toBeChecked();
    expect(
      screen.getByText("날짜를 뒤 달로 옮기면 고를 수 없습니다."),
    ).toBeInTheDocument();
  });
});
