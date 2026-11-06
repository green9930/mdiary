import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetInAppHistory, useTrackInAppHistory } from "@/hooks/useGoBack";

import PageHeader from "./PageHeader";

const router = vi.hoisted(() => ({ back: vi.fn(), replace: vi.fn() }));
const nav = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => nav.pathname,
}));

/** 앱을 path에서 연 뒤 next들로 옮긴다 */
const visit = (path: string, ...next: string[]) => {
  nav.pathname = path;
  const { rerender } = renderHook(() => useTrackInAppHistory());
  for (const p of next) {
    nav.pathname = p;
    rerender();
  }
};

describe("PageHeader (토큰 5-7 헤더)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetInAppHistory();
  });

  it("제목을 보여준다", () => {
    render(<PageHeader title="기록하기" />);
    expect(
      screen.getByRole("heading", { name: "기록하기" }),
    ).toBeInTheDocument();
  });

  it("앱 안에서 옮겨 왔으면 [‹]는 이전 화면으로 간다", async () => {
    visit("/", "/expenses/new");
    render(<PageHeader title="기록하기" />);
    await userEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("주소로 바로 들어왔으면 이전 기록이 있어도 달력으로 간다", async () => {
    window.history.pushState({}, "", "/somewhere");
    visit("/expenses/new");
    render(<PageHeader title="기록하기" />);
    await userEvent.click(screen.getByRole("button", { name: "뒤로" }));
    expect(router.replace).toHaveBeenCalledWith("/");
    expect(router.back).not.toHaveBeenCalled();
  });
});
