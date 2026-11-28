import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CategoriesView from "@/components/categories/CategoriesView";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";

const navigation = { search: "" };
const replace = vi.fn();
const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push, back }),
  usePathname: () => "/categories",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const today = "2026-10-21";

const october = {
  total: 1_234_500,
  count: 42,
  categories: [
    { category: "LIVING", total: 519_700, count: 10 },
    { category: "FOOD", total: 345_700, count: 23 },
  ],
};

interface ServerOptions {
  statsFails?: boolean;
}

const mockServer = ({ statsFails = false }: ServerOptions = {}) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/api/stats") {
      if (statsFails)
        return Response.json({ code: "INTERNAL" }, { status: 500 });
      return Response.json(
        url.searchParams.get("from") === "2026-10"
          ? october
          : { total: 0, count: 0, categories: [] },
      );
    }
    return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  });

const renderView = (search = "") => {
  navigation.search = search;
  const client = createQueryClient({ onUnauthorized: () => {} });
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  return render(
    <QueryClientProvider client={client}>
      <CategoriesView today={today} />
    </QueryClientProvider>,
  );
};

beforeEach(async () => {
  vi.clearAllMocks();
  await new Promise((resolve) => setTimeout(resolve, 20));
  resetHistoryLayers();
});

afterEach(() => vi.restoreAllMocks());

describe("CategoriesView (화면 명세 SC-04)", () => {
  it("첫 로딩은 스켈레톤을 보여준 뒤 기간 요약과 비중 그래프를 그린다", async () => {
    mockServer();
    renderView();

    expect(
      screen.getByRole("status", { name: "불러오는 중" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("총지출 · 42건")).toBeInTheDocument();
    expect(screen.getByText("1,234,500원")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "카테고리별 비중" }),
    ).toHaveTextContent("생활42.1%519,700원식비28.0%345,700원");
    expect(screen.getByRole("button", { name: "기간: 이번 달" })).toBeVisible();
  });

  it("기간에 기록이 없으면 그래프 자리에 빈 상태", async () => {
    mockServer();
    renderView("from=2026-09&to=2026-09&sort=latest");

    expect(
      await screen.findByText("해당 기간 내 기록이 없습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("총지출 · 0건")).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "카테고리별 비중" }),
    ).not.toBeInTheDocument();
  });

  it("조회에 실패하면 [다시 시도]", async () => {
    const fetch = mockServer({ statsFails: true });
    renderView();

    await userEvent.click(
      await screen.findByRole("button", { name: "다시 시도" }),
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });

  it("기간 드롭다운에서 고르면 그 기간으로 주소를 바꾼다", async () => {
    mockServer();
    renderView();

    await userEvent.click(
      await screen.findByRole("button", { name: "기간: 이번 달" }),
    );
    await userEvent.click(screen.getByRole("option", { name: "최근 6개월" }));
    expect(replace).toHaveBeenCalledWith(
      "/categories?from=2026-05&to=2026-10&sort=latest",
      { scroll: false },
    );
  });

  it("기간 선택 시트에서 [적용]하면 시트를 닫은 뒤 그 기간으로 주소를 바꾼다", async () => {
    mockServer();
    renderView();

    await userEvent.click(
      await screen.findByRole("button", { name: "기간 선택" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "8월", hidden: true }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "적용", hidden: true }),
    );
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/categories?from=2026-08&to=2026-10&sort=latest",
        { scroll: false },
      ),
    );
  });

  it("그래프 줄을 누르면 그 카테고리로 필터한다", async () => {
    mockServer();
    renderView();

    await userEvent.click(await screen.findByRole("button", { name: /^식비/ }));
    expect(replace).toHaveBeenCalledWith(
      "/categories?from=2026-10&to=2026-10&category=food&sort=latest",
      { scroll: false },
    );
  });
});
