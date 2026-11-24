import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EditExpenseView from "@/components/expense/EditExpenseView";
import { resetInAppHistory } from "@/hooks/useGoBack";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";

const router = vi.hoisted(() => ({ back: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/expenses/e1/edit",
}));

const detail = {
  expense: {
    id: "e1",
    date: "2026-10-18",
    title: "점심",
    category: "FOOD",
    amount: 8000,
    content: null,
  },
};

const mockDetail = (respond: () => Response | Promise<Response>) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    if (url === "/api/expenses/e1") return respond();
    if (url === "/api/titles") return Response.json({ titles: [] });
    throw new Error(`unexpected ${url}`);
  });

const renderView = () => {
  const client = createQueryClient({ onUnauthorized: () => {} });
  client.setDefaultOptions({ queries: { retry: false } });
  return render(
    <QueryClientProvider client={client}>
      <EditExpenseView id="e1" today="2026-10-21" />
    </QueryClientProvider>,
  );
};

beforeEach(async () => {
  vi.clearAllMocks();
  resetInAppHistory();
  await new Promise((resolve) => setTimeout(resolve, 20));
  resetHistoryLayers();
});

afterEach(() => vi.restoreAllMocks());

describe("EditExpenseView (화면 명세 SC-06 수정)", () => {
  it("불러오는 동안 스켈레톤을 보여 주고, 원래 값을 채운 수정 폼을 연다", async () => {
    mockDetail(() => Response.json(detail));
    renderView();

    expect(screen.getByRole("heading", { name: "수정하기" }));
    expect(screen.getByRole("status", { name: "불러오는 중" }));
    expect(await screen.findByRole("textbox", { name: "제목" })).toHaveValue(
      "점심",
    );
  });

  it("없는 기록이면 기록 없음 알림을 띄우고, [확인]하면 달력으로 간다", async () => {
    mockDetail(() => Response.json({ code: "NOT_FOUND" }, { status: 404 }));
    renderView();

    const alert = await waitFor(() =>
      screen.getByRole("alertdialog", { name: "기록 없음", hidden: true }),
    );
    expect(alert).toHaveAccessibleDescription("이미 삭제된 기록입니다.");
    await userEvent.click(
      within(alert).getByRole("button", { name: "확인", hidden: true }),
    );

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
  });

  it("불러오지 못하면 [다시 시도]를 보여 준다", async () => {
    mockDetail(() => Response.json({ code: "INTERNAL" }, { status: 500 }));
    renderView();

    expect(
      await screen.findByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
  });
});
