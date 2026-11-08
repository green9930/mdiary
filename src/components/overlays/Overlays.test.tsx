import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetHistoryLayers } from "@/hooks/useHistoryLayer";

import BottomSheet from "./BottomSheet";
import Dialog from "./Dialog";
import Dropdown from "./Dropdown";

// jsdom의 <dialog>는 접근성 트리에서 open 여부를 따르지 않으므로 hidden까지 찾는다
const dialogByName = (name: string) =>
  screen.getByRole("alertdialog", { name, hidden: true });

describe("Dialog (CG ⑧)", () => {
  beforeEach(() => resetHistoryLayers());

  it("확인형은 버튼 2개, 알림형은 버튼 1개다", () => {
    const { rerender } = render(
      <Dialog
        open
        title="삭제"
        confirmLabel="삭제"
        confirmVariant="danger"
        onConfirm={() => {}}
        cancelLabel="취소"
        onCancel={() => {}}
      >
        이 기록을 삭제하시겠습니까?
      </Dialog>,
    );
    expect(screen.getAllByRole("button", { hidden: true })).toHaveLength(2);

    rerender(
      <Dialog
        open
        title="저장하지 못했습니다"
        confirmLabel="확인"
        onConfirm={() => {}}
      >
        잠시 후 다시 시도해 주세요.
      </Dialog>,
    );
    expect(screen.getAllByRole("button", { hidden: true })).toHaveLength(1);
  });

  it("버튼을 누르면 각각 onConfirm·onCancel을 부른다", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Dialog
        open
        confirmLabel="삭제"
        onConfirm={onConfirm}
        cancelLabel="취소"
        onCancel={onCancel}
      >
        이 기록을 삭제하시겠습니까?
      </Dialog>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "취소", hidden: true }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "삭제", hidden: true }),
    );
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("바깥 탭·Esc로 닫히지 않는다", () => {
    const onCancel = vi.fn();
    render(
      <Dialog
        open
        title="나가기"
        confirmLabel="나가기"
        onConfirm={() => {}}
        cancelLabel="계속 작성"
        onCancel={onCancel}
      >
        작성 중인 내용이 사라집니다.
      </Dialog>,
    );
    const dialog = dialogByName("나가기") as HTMLDialogElement;
    fireEvent.click(dialog);
    const esc = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("브라우저가 강제로 닫아도 open이면 다시 연다", () => {
    render(
      <Dialog open title="알림" confirmLabel="확인" onConfirm={() => {}}>
        본문
      </Dialog>,
    );
    const dialog = dialogByName("알림") as HTMLDialogElement;
    dialog.close();
    expect(dialog.open).toBe(true);
  });

  it("요청 중이면 실행 버튼은 스피너, 취소도 막는다", () => {
    render(
      <Dialog
        open
        confirmLabel="삭제"
        onConfirm={() => {}}
        cancelLabel="취소"
        onCancel={() => {}}
        loading
      >
        본문
      </Dialog>,
    );
    expect(
      screen.getByRole("button", { name: "삭제", hidden: true }),
    ).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByRole("button", { name: "취소", hidden: true }),
    ).toBeDisabled();
  });
});

describe("BottomSheet (CG ⑦)", () => {
  beforeEach(() => resetHistoryLayers());

  const Harness = () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <span data-testid="state">{open ? "열림" : "닫힘"}</span>
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="기간 선택"
        >
          <p>시트 내용</p>
        </BottomSheet>
      </>
    );
  };

  it("제목으로 시트를 찾을 수 있다", () => {
    render(<Harness />);
    expect(
      screen.getByRole("dialog", { name: "기간 선택", hidden: true }),
    ).toBeInTheDocument();
  });

  it("바깥(가림막)을 누르면 닫힌다", () => {
    render(<Harness />);
    fireEvent.click(
      screen.getByRole("dialog", { name: "기간 선택", hidden: true }),
    );
    expect(screen.getByTestId("state")).toHaveTextContent("닫힘");
  });

  it("시트 안을 누르면 닫히지 않는다", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("시트 내용"));
    expect(screen.getByTestId("state")).toHaveTextContent("열림");
  });

  it("Esc로 닫는다", () => {
    render(<Harness />);
    const sheet = screen.getByRole("dialog", {
      name: "기간 선택",
      hidden: true,
    });
    fireEvent(sheet, new Event("cancel", { cancelable: true }));
    expect(screen.getByTestId("state")).toHaveTextContent("닫힘");
  });

  it("손잡이를 시트 높이의 1/4보다 많이 끌어내리면 닫힌다", () => {
    render(<Harness />);
    const sheet = screen.getByRole("dialog", {
      name: "기간 선택",
      hidden: true,
    });
    Object.defineProperty(sheet, "offsetHeight", { value: 400 });
    // 천천히 끈다 (1초): 빠르게 튕기기로 닫히지 않게
    const now = vi.spyOn(performance, "now");
    const handle = screen.getByTestId("sheet-handle");
    handle.setPointerCapture = () => {};
    now.mockReturnValueOnce(0).mockReturnValueOnce(1000);
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientY: 150, pointerId: 1 });
    fireEvent.pointerUp(handle, {
      clientY: 150,
      pointerId: 1,
    });
    expect(screen.getByTestId("state")).toHaveTextContent("열림");

    now.mockReturnValueOnce(0).mockReturnValueOnce(1000);
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(handle, {
      clientY: 250,
      pointerId: 1,
    });
    expect(screen.getByTestId("state")).toHaveTextContent("닫힘");
  });
});

describe("Dropdown (CG ⑥)", () => {
  const SORT = [
    { value: "latest", label: "최신순" },
    { value: "amount", label: "금액순" },
  ] as const;

  const Harness = () => {
    const [value, setValue] = useState<"latest" | "amount">("latest");
    return (
      <>
        <Dropdown
          aria-label="정렬"
          options={SORT}
          value={value}
          onValueChange={setValue}
        />
        <p>바깥</p>
      </>
    );
  };

  it("버튼을 누르면 메뉴가 펼쳐지고, 고른 항목이 표시된다", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "정렬: 최신순" }));
    expect(screen.getByRole("option", { name: "최신순" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("항목을 고르면 값이 바뀌고 닫힌다", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "정렬: 최신순" }));
    await userEvent.click(screen.getByRole("option", { name: "금액순" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "정렬: 금액순" }),
    ).toBeInTheDocument();
  });

  it("바깥을 누르면 값은 그대로 두고 닫힌다", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "정렬: 최신순" }));
    await userEvent.click(screen.getByText("바깥"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "정렬: 최신순" }),
    ).toBeInTheDocument();
  });
});
