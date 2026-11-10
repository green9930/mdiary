import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TabBar from "@/components/layout/TabBar";
import { clearTabUrls } from "@/hooks/useTabNavigation";

const navigation = vi.hoisted(() => ({ pathname: "/", search: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const goTo = (url: string) => {
  const [pathname = "/", search = ""] = url.split("?");
  navigation.pathname = pathname;
  navigation.search = search;
};

const tab = (name: string) => screen.getByRole("link", { name });

describe("TabBar (SC-01)", () => {
  beforeEach(() => {
    clearTabUrls();
    goTo("/");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("탭 네 개와 ＋ 등록 버튼을 보여준다", () => {
    render(<TabBar />);
    expect(tab("달력")).toHaveAttribute("href", "/");
    expect(tab("카테고리")).toHaveAttribute("href", "/categories");
    expect(tab("검색")).toHaveAttribute("href", "/search");
    expect(tab("설정")).toHaveAttribute("href", "/settings");
    expect(tab("기록하기")).toBeInTheDocument();
  });

  it("현재 탭만 강조한다", () => {
    goTo("/search");
    render(<TabBar />);
    expect(tab("검색")).toHaveAttribute("aria-current", "page");
    expect(tab("달력")).not.toHaveAttribute("aria-current");
  });

  it("하위 경로도 그 탭으로 본다", () => {
    goTo("/settings/account");
    render(<TabBar />);
    expect(tab("설정")).toHaveAttribute("aria-current", "page");
  });

  it("＋ 버튼은 서울 기준 오늘 날짜로 등록 화면을 연다", () => {
    vi.useFakeTimers({ now: new Date("2026-10-17T15:30:00Z") });
    render(<TabBar />);
    expect(tab("기록하기")).toHaveAttribute(
      "href",
      "/expenses/new?date=2026-10-18",
    );
  });

  it("다른 탭에 갔다 돌아오면 그 탭의 마지막 상태로 간다", () => {
    goTo("/categories?period=6m&category=FOOD");
    const { rerender } = render(<TabBar />);
    goTo("/search?q=커피");
    rerender(<TabBar />);
    expect(tab("카테고리")).toHaveAttribute(
      "href",
      "/categories?period=6m&category=FOOD",
    );
  });

  it("현재 탭을 다시 누르면 기본 상태로 간다", () => {
    goTo("/?month=2026-08&date=2026-08-14");
    render(<TabBar />);
    expect(tab("달력")).toHaveAttribute("href", "/");
  });
});
