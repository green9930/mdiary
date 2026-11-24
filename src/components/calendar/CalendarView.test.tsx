import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CalendarView from "@/components/calendar/CalendarView";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";

const navigation = { search: "" };
const replace = vi.fn();
const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push, back }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(navigation.search),
}));

const today = "2026-10-21";

const october = {
  total: 1_101_300,
  days: [
    { date: "2026-10-10", total: 1_080_000 },
    { date: "2026-10-18", total: 21_300 },
  ],
};

const items = [
  {
    id: "e1",
    date: "2026-10-18",
    title: "점심 김밥",
    category: "FOOD",
    amount: 8000,
  },
  {
    id: "e2",
    date: "2026-10-18",
    title: "넷플릭스",
    category: "LIVING",
    amount: 13300,
    series: { type: "RECURRING", seq: 2, totalCount: null },
  },
];

interface ServerOptions {
  calendarFails?: boolean;
}

// 주소별 응답. 등록되지 않은 달·날짜는 빈 결과
const mockServer = ({ calendarFails = false }: ServerOptions = {}) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/api/calendar") {
      if (calendarFails)
        return Response.json({ code: "INTERNAL" }, { status: 500 });
      return Response.json(
        url.searchParams.get("month") === "2026-10"
          ? october
          : { total: 0, days: [] },
      );
    }
    if (url.pathname === "/api/expenses/e1")
      return Response.json({ expense: { ...items[0], content: null } });
    if (url.pathname === "/api/expenses")
      return Response.json({
        items: url.searchParams.get("date") === "2026-10-18" ? items : [],
      });
    return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  });

const renderView = (search: string) => {
  navigation.search = search;
  const client = createQueryClient({ onUnauthorized: () => {} });
  client.setDefaultOptions({
    queries: { ...client.getDefaultOptions().queries, retry: false },
  });
  const tree = () => (
    <QueryClientProvider client={client}>
      <CalendarView today={today} />
    </QueryClientProvider>
  );
  const result = render(tree());
  // 주소가 바뀐 것처럼 다시 그린다
  return { ...result, refresh: () => result.rerender(tree()) };
};

beforeEach(async () => {
  vi.clearAllMocks();
  await new Promise((resolve) => setTimeout(resolve, 20));
  resetHistoryLayers();
});

afterEach(() => vi.restoreAllMocks());

describe("CalendarView (화면 명세 SC-03)", () => {
  it("첫 로딩은 스켈레톤을 보여준 뒤 월 합계·칸 금액·하루 목록을 그린다", async () => {
    mockServer();
    renderView("month=2026-10&date=2026-10-18");

    expect(
      screen.getAllByRole("status", { name: "불러오는 중" }).length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText("1,101,300원")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2026년 10월 10일 (토) 1,080,000원" }),
    ).toHaveTextContent("108만");
    expect(await screen.findByText("2건 · 21,300원")).toBeInTheDocument();
    expect(screen.getByText("넷플릭스")).toBeInTheDocument();
    expect(screen.getByText("정기")).toBeInTheDocument();
  });

  it("하루 목록의 항목을 누르면 상세 시트를 연다 (기록을 쌓는다)", async () => {
    mockServer();
    renderView("month=2026-10&date=2026-10-18");

    await userEvent.click(
      await screen.findByRole("button", { name: /점심 김밥/ }),
    );

    expect(push).toHaveBeenCalledWith(
      "/?month=2026-10&date=2026-10-18&expense=e1",
      { scroll: false },
    );
  });

  it("쿼리 expense가 있으면 상세 시트를 열고, [수정]은 시트를 닫은 뒤 수정 화면으로 간다", async () => {
    mockServer();
    const view = renderView("month=2026-10&date=2026-10-18&expense=e1");
    const sheet = screen.getByRole("dialog", {
      name: "기록 상세",
      hidden: true,
    });
    expect(sheet).toHaveAttribute("open");
    await within(sheet).findByText("8,000원");

    await userEvent.click(
      within(sheet).getByRole("button", { name: "수정", hidden: true }),
    );
    // 주소로 열린 시트는 쿼리만 지운다. 지운 주소가 된 뒤 수정 화면으로 간다
    expect(replace).toHaveBeenCalledWith("/?month=2026-10&date=2026-10-18", {
      scroll: false,
    });
    expect(push).not.toHaveBeenCalled();
    navigation.search = "month=2026-10&date=2026-10-18";
    view.refresh();

    expect(push).toHaveBeenCalledWith("/expenses/e1/edit");
  });

  it("날짜를 누르면 그 날짜를 고른다", async () => {
    mockServer();
    renderView("month=2026-10&date=2026-10-18");
    await screen.findByText("1,101,300원");

    await userEvent.click(
      screen.getByRole("button", { name: "2026년 10월 5일 (월)" }),
    );

    expect(replace).toHaveBeenCalledWith("/?month=2026-10&date=2026-10-05", {
      scroll: false,
    });
  });

  it("‹ ›는 이전·다음 달 1일로 옮긴다", async () => {
    mockServer();
    renderView("month=2026-10&date=2026-10-18");
    await screen.findByText("1,101,300원");

    await userEvent.click(screen.getByRole("button", { name: "이전 달" }));
    expect(replace).toHaveBeenLastCalledWith(
      "/?month=2026-09&date=2026-09-01",
      { scroll: false },
    );
    await userEvent.click(screen.getByRole("button", { name: "다음 달" }));
    expect(replace).toHaveBeenLastCalledWith(
      "/?month=2026-11&date=2026-11-01",
      { scroll: false },
    );
  });

  it("이번 달이 아니면 [오늘]이 보이고 누르면 이번 달·오늘로 간다", async () => {
    mockServer();
    renderView("month=2026-08&date=2026-08-01");
    expect(
      await screen.findByRole("button", { name: "2026년 8월 연·월 선택" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "오늘" }));

    expect(replace).toHaveBeenCalledWith("/?month=2026-10&date=2026-10-21", {
      scroll: false,
    });
  });

  it("이번 달에서는 [오늘]을 보여주지 않는다", async () => {
    mockServer();
    renderView("");
    await screen.findByText("1,101,300원");
    expect(
      screen.queryByRole("button", { name: "오늘" }),
    ).not.toBeInTheDocument();
  });

  it("선택 가능 연도의 처음 2020년 1월에서는 [‹]를 막는다", async () => {
    mockServer();
    renderView("month=2020-01&date=2020-01-01");

    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled(),
    );
  });

  it("선택한 날 기록이 없으면 [기록 추가하기]로 그 날짜의 등록 화면을 연다", async () => {
    mockServer();
    renderView("month=2026-10&date=2026-10-19");

    await userEvent.click(
      await screen.findByRole("button", { name: "기록 추가하기" }),
    );

    expect(push).toHaveBeenCalledWith("/expenses/new?date=2026-10-19");
  });

  it("연·월 선택 시트에서 월을 누르면 그 달로 옮기고 닫는다", async () => {
    mockServer();
    renderView("month=2026-10&date=2026-10-18");
    await screen.findByText("1,101,300원");

    await userEvent.click(
      screen.getByRole("button", { name: "2026년 10월 연·월 선택" }),
    );
    const sheet = screen.getByRole("dialog", { name: "연·월 선택" });
    await userEvent.click(within(sheet).getByRole("button", { name: "3월" }));

    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/?month=2026-03&date=2026-03-01", {
        scroll: false,
      }),
    );
  });

  it("조회에 실패하면 달력 영역을 [다시 시도]로 바꾼다", async () => {
    mockServer({ calendarFails: true });
    renderView("month=2026-10&date=2026-10-18");

    expect(await screen.findByText("불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  });
});
