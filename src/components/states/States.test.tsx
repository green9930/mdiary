import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AlertDialog from "@/components/overlays/AlertDialog";
import EmptyState from "@/components/states/EmptyState";
import LoadError from "@/components/states/LoadError";
import LoadMoreStatus from "@/components/states/LoadMoreStatus";
import RefreshErrorBar from "@/components/states/RefreshErrorBar";
import {
  SkeletonArea,
  SkeletonLine,
  SkeletonListItem,
} from "@/components/states/Skeleton";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";

describe("Skeleton (CM ①)", () => {
  it("영역 하나만 '불러오는 중'으로 읽히고 조각은 읽히지 않는다", () => {
    render(
      <SkeletonArea>
        <SkeletonLine width="1/2" />
        <SkeletonListItem />
      </SkeletonArea>,
    );
    const area = screen.getByRole("status", { name: "불러오는 중" });
    expect(area).toHaveAttribute("aria-busy", "true");
    for (const piece of area.children) {
      expect(piece).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("움직임 줄이기 설정이면 깜박이지 않는다", () => {
    render(
      <SkeletonArea>
        <SkeletonLine width="full" />
      </SkeletonArea>,
    );
    const area = screen.getByRole("status");
    expect(area.firstElementChild).toHaveClass(
      "animate-skeleton",
      "motion-reduce:animate-none",
    );
  });
});

describe("LoadError (CM ②)", () => {
  it("[다시 시도]는 지금 조건으로 다시 조회하고, 조회 중에는 비활성이다", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <LoadError onRetry={onRetry} retrying={false} />,
    );
    expect(screen.getByText("불러오지 못했습니다.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<LoadError onRetry={onRetry} retrying />);
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeDisabled();
  });
});

describe("RefreshErrorBar (CM ③)", () => {
  it("띠로 알리고 [다시 시도]는 조회 중 비활성이다", async () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <RefreshErrorBar onRetry={onRetry} retrying={false} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "최신 내용을 불러오지 못했습니다.",
    );
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<RefreshErrorBar onRetry={onRetry} retrying />);
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeDisabled();
  });
});

describe("LoadMoreStatus (CM ④)", () => {
  it("불러오는 중에는 로딩 표시, 실패하면 [다시 시도], 그 밖에는 아무것도 없다", async () => {
    const onRetry = vi.fn();
    const { rerender, container } = render(
      <LoadMoreStatus loading failed={false} onRetry={onRetry} />,
    );
    expect(
      screen.getByRole("status", { name: "불러오는 중" }),
    ).toBeInTheDocument();

    rerender(<LoadMoreStatus loading={false} failed onRetry={onRetry} />);
    expect(screen.getByText("더 불러오지 못했습니다.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(
      <LoadMoreStatus loading={false} failed={false} onRetry={onRetry} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("EmptyState", () => {
  it("문구와, 있으면 버튼 하나를 보여준다", async () => {
    const onAction = vi.fn();
    const { rerender } = render(<EmptyState message="기록이 없습니다" />);
    expect(screen.getByText("기록이 없습니다")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <EmptyState
        message="기록이 없습니다"
        actionLabel="기록 추가하기"
        onAction={onAction}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "기록 추가하기" }),
    );
    expect(onAction).toHaveBeenCalledOnce();
  });
});

describe("AlertDialog (CM ⑤⑥)", () => {
  beforeEach(() => resetHistoryLayers());

  it("제목·본문과 [확인] 하나만 있고, [확인]으로 닫는다", async () => {
    const onClose = vi.fn();
    render(
      <AlertDialog open title="저장하기" onClose={onClose}>
        저장하지 못했습니다. 잠시 후 다시 시도해 주세요.
      </AlertDialog>,
    );
    const dialog = screen.getByRole("alertdialog", {
      name: "저장하기",
      hidden: true,
    });
    expect(dialog).toHaveAccessibleDescription(
      "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
    expect(screen.getAllByRole("button", { hidden: true })).toHaveLength(1);

    await userEvent.click(
      screen.getByRole("button", { name: "확인", hidden: true }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
