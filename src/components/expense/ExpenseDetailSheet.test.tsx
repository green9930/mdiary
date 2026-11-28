import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExpenseDetailSheet from "@/components/expense/ExpenseDetailSheet";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";
import type { ExpenseDetail } from "@/types/expenseTypes";

const id = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
const detail: ExpenseDetail = {
  expense: {
    id,
    date: "2026-10-18",
    title: "점심 김밥",
    category: "FOOD",
    amount: 8000,
    content: "회사 앞\n김밥집",
  },
};

interface Server {
  get?: () => Response;
  remove?: () => Response;
  /** GET /api/expenses/:id/scope (쿼리를 받아 미리보기) */
  scope?: (query: URLSearchParams) => Response;
}

// GET·DELETE /api/expenses/:id, GET /api/expenses/:id/scope
const mockServer = ({ get, remove, scope }: Server = {}) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.includes("/scope?"))
      return (
        scope?.(new URL(url, "http://localhost").searchParams) ??
        Response.json({})
      );
    if (init?.method === "DELETE")
      return remove?.() ?? Response.json({ deleted: 1 });
    return get?.() ?? Response.json(detail);
  });

const notFound = () => Response.json({ code: "NOT_FOUND" }, { status: 404 });

const handlers = { onClose: vi.fn(), onEdit: vi.fn() };

const renderSheet = (expenseId: string | null = id) => {
  const client = createQueryClient({ onUnauthorized: () => {} });
  client.setDefaultOptions({ queries: { retry: false } });
  return render(
    <QueryClientProvider client={client}>
      <ExpenseDetailSheet expenseId={expenseId} {...handlers} />
    </QueryClientProvider>,
  );
};

const sheet = () =>
  screen.getByRole("dialog", { name: "기록 상세", hidden: true });
const alert = (name: string) =>
  screen.getByRole("alertdialog", { name, hidden: true });
const button = (name: string, scope: HTMLElement = document.body) =>
  within(scope).getByRole("button", { name, hidden: true });

beforeEach(async () => {
  handlers.onClose.mockReset();
  handlers.onEdit.mockReset();
  await new Promise((resolve) => setTimeout(resolve, 20));
  resetHistoryLayers();
});

afterEach(() => vi.restoreAllMocks());

describe("ExpenseDetailSheet (화면 명세 SC-08)", () => {
  it("기록의 제목·카테고리·금액·날짜·내용을 보여 준다", async () => {
    mockServer();
    renderSheet();

    await waitFor(() => expect(within(sheet()).getByText("점심 김밥")));
    const view = within(sheet());
    expect(view.getByText("식비")).toBeInTheDocument();
    expect(view.getByText("8,000원")).toBeInTheDocument();
    expect(view.getByText("2026년 10월 18일 (일)")).toBeInTheDocument();
    expect(view.getByText(/회사 앞/)).toHaveClass("whitespace-pre-wrap");
    expect(sheet()).toHaveAttribute("open");
  });

  it("불러오는 중이면 시트 안에 스켈레톤을 보여 준다", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}),
    );
    renderSheet();

    expect(
      within(sheet()).getByRole("status", {
        name: "불러오는 중",
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it("[수정]은 그 기록의 수정 화면을 연다", async () => {
    mockServer();
    renderSheet();
    await waitFor(() => within(sheet()).getByText("점심 김밥"));

    await userEvent.click(button("수정", sheet()));

    expect(handlers.onEdit).toHaveBeenCalledWith(id);
  });

  it("[삭제] → 확인 [삭제]하면 지우고 시트를 닫는다", async () => {
    const fetch = mockServer();
    renderSheet();
    await waitFor(() => within(sheet()).getByText("점심 김밥"));

    await userEvent.click(button("삭제", sheet()));
    const confirm = alert("삭제하기");
    expect(confirm).toHaveAccessibleDescription("이 기록을 삭제하시겠습니까?");
    await userEvent.click(button("삭제", confirm));

    await waitFor(() => expect(handlers.onClose).toHaveBeenCalledOnce());
    const remove = fetch.mock.calls.find(
      ([, init]) => init?.method === "DELETE",
    );
    expect(String(remove?.[0])).toBe(`/api/expenses/${id}`);
  });

  it("[취소]는 확인만 닫는다", async () => {
    mockServer();
    renderSheet();
    await waitFor(() => within(sheet()).getByText("점심 김밥"));

    await userEvent.click(button("삭제", sheet()));
    await userEvent.click(button("취소", alert("삭제하기")));

    expect(document.querySelector("dialog[role=alertdialog][open]")).toBeNull();
    expect(handlers.onClose).not.toHaveBeenCalled();
  });

  it("삭제가 실패하면 알림을 띄우고 시트는 그대로 둔다", async () => {
    mockServer({
      remove: () => Response.json({ code: "INTERNAL" }, { status: 500 }),
    });
    renderSheet();
    await waitFor(() => within(sheet()).getByText("점심 김밥"));

    await userEvent.click(button("삭제", sheet()));
    await userEvent.click(button("삭제", alert("삭제하기")));

    await waitFor(() =>
      expect(alert("삭제하기")).toHaveAccessibleDescription(
        "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      ),
    );
    await userEvent.click(button("확인", alert("삭제하기")));
    expect(sheet()).toHaveAttribute("open");
    expect(handlers.onClose).not.toHaveBeenCalled();
  });

  it("없는 기록이면 시트를 닫고 알림을 띄우며, [확인]하면 쿼리를 지운다", async () => {
    mockServer({ get: notFound });
    renderSheet();
    const opened = sheet();

    await waitFor(() =>
      expect(alert("기록 없음")).toHaveAccessibleDescription(
        "이미 삭제된 기록입니다.",
      ),
    );
    await waitFor(() => expect(opened).not.toHaveAttribute("open"));

    await userEvent.click(button("확인", alert("기록 없음")));
    await waitFor(() => expect(handlers.onClose).toHaveBeenCalledOnce());
  });

  it("삭제하려는데 이미 없으면 기록 없음 알림 뒤 닫는다", async () => {
    mockServer({ remove: notFound });
    renderSheet();
    await waitFor(() => within(sheet()).getByText("점심 김밥"));

    await userEvent.click(button("삭제", sheet()));
    await userEvent.click(button("삭제", alert("삭제하기")));
    await userEvent.click(
      button("확인", await waitFor(() => alert("기록 없음"))),
    );

    await waitFor(() => expect(handlers.onClose).toHaveBeenCalledOnce());
  });

  describe("반복 기록 (SC-09 삭제 범위)", () => {
    // 할부 3회 중 2회차 (12월 1일). 남은 건수 2
    const installment = {
      expense: { ...detail.expense, date: "2026-12-01" },
      series: {
        type: "INSTALLMENT",
        seq: 2,
        totalCount: 3,
        billingDay: 1,
        isContinuous: false,
        installmentTotal: 300_000,
        fromMonth: "2026-11",
        toMonth: "2027-01",
      },
    };
    const scopePreview = (query: URLSearchParams) => {
      const type = query.get("scope");
      const count = type === "one" ? 1 : type === "after" ? 2 : 1;
      return Response.json({
        remaining: 2,
        affected: {
          count,
          fromMonth: "2026-12",
          toMonth: count === 2 ? "2027-01" : "2026-12",
          continuous: false,
        },
      });
    };
    const scopeSheet = () =>
      screen.getByRole("dialog", { name: "반복 기록 삭제", hidden: true });
    const radio = (name: string) =>
      screen.getByRole("radio", { name, hidden: true });

    const openScope = async () => {
      await waitFor(() =>
        within(sheet()).getByText("할부 2/3회 · 총 300,000원"),
      );
      await userEvent.click(button("삭제", sheet()));
      return waitFor(() => scopeSheet());
    };

    it("반복 정보를 보여 주고, [수정]은 수정 화면으로 간다", async () => {
      mockServer({ get: () => Response.json(installment) });
      renderSheet();

      await waitFor(() =>
        within(sheet()).getByText("할부 2/3회 · 총 300,000원"),
      );
      expect(within(sheet()).getByText("2026년 11월 ~ 2027년 1월"));
      await userEvent.click(button("수정", sheet()));
      expect(handlers.onEdit).toHaveBeenCalledWith(id);
    });

    it("[삭제]는 시트 안에서 범위 선택으로 바뀌고, [취소]로 상세에 돌아온다", async () => {
      mockServer({
        get: () => Response.json(installment),
        scope: scopePreview,
      });
      renderSheet();

      const view = within(await openScope());
      expect(radio("이번 건만")).toBeChecked();
      expect(radio("이후 전체 (남은 회차)")).toBeEnabled();
      await waitFor(() => view.getByText("2026년 12월 1일 1건"));

      await userEvent.click(button("취소", scopeSheet()));
      expect(within(sheet()).getByText("할부 2/3회 · 총 300,000원"));
    });

    it("이후 전체를 고르면 범위를 보여 주고, 건수를 확인한 뒤 그 범위로 지운다", async () => {
      const fetch = mockServer({
        get: () => Response.json(installment),
        scope: scopePreview,
        remove: () => Response.json({ deleted: 2 }),
      });
      renderSheet();
      const view = within(await openScope());

      await userEvent.click(radio("이후 전체 (남은 회차)"));
      await waitFor(() => view.getByText("2026년 12월 ~ 2027년 1월 (2건)"));
      await userEvent.click(button("삭제", scopeSheet()));

      const confirm = await waitFor(() => alert("삭제하기"));
      expect(confirm).toHaveAccessibleDescription("2건을 삭제하시겠습니까?");
      await userEvent.click(button("삭제", confirm));

      await waitFor(() => expect(handlers.onClose).toHaveBeenCalledOnce());
      const removeCall = fetch.mock.calls.find(
        ([, init]) => init?.method === "DELETE",
      );
      expect(JSON.parse(String(removeCall?.[1]?.body))).toEqual({
        scope: { type: "after" },
      });
    });

    it("N이 비었거나 남은 건수를 넘으면 칸 아래 오류를 보이고 진행하지 않는다", async () => {
      mockServer({
        get: () => Response.json(installment),
        scope: scopePreview,
      });
      renderSheet();
      await openScope();
      await waitFor(() =>
        within(scopeSheet()).getByText("2026년 12월 1일 1건"),
      );

      await userEvent.click(radio("이 건부터"));
      const count = screen.getByRole("textbox", {
        name: "개월 수",
        hidden: true,
      });
      await userEvent.click(button("삭제", scopeSheet()));
      expect(count).toHaveAccessibleDescription("개월 수를 입력해 주세요.");

      await userEvent.type(count, "5");
      await userEvent.click(button("삭제", scopeSheet()));
      expect(count).toHaveAccessibleDescription(
        "2개월까지 입력할 수 있습니다.",
      );
      expect(
        document.querySelector("dialog[role=alertdialog][open]"),
      ).toBeNull();
    });

    it("계속 반복의 이후 전체는 반복 종료를 확인한다", async () => {
      mockServer({
        get: () =>
          Response.json({
            ...installment,
            series: {
              ...installment.series,
              type: "RECURRING",
              totalCount: null,
              isContinuous: true,
              installmentTotal: null,
            },
          }),
        scope: (query) =>
          Response.json({
            remaining: null,
            affected:
              query.get("scope") === "after"
                ? {
                    count: null,
                    fromMonth: "2026-12",
                    toMonth: null,
                    continuous: true,
                  }
                : {
                    count: 1,
                    fromMonth: "2026-12",
                    toMonth: "2026-12",
                    continuous: false,
                  },
          }),
      });
      renderSheet();
      await waitFor(() =>
        within(sheet()).getByText(/정기지출 · 매달 1일 · 반복/),
      );
      await userEvent.click(button("삭제", sheet()));
      const view = within(await waitFor(() => scopeSheet()));

      await userEvent.click(radio("이후 전체"));
      await waitFor(() => view.getByText("2026년 12월부터 계속"));
      await userEvent.click(button("삭제", scopeSheet()));

      expect(
        await waitFor(() => alert("삭제하기")),
      ).toHaveAccessibleDescription(
        "이 건부터 반복이 종료됩니다. 삭제하시겠습니까?",
      );
    });
  });

  it("닫혀 있으면 요청하지 않는다", () => {
    const fetch = mockServer();
    renderSheet(null);
    expect(fetch).not.toHaveBeenCalled();
  });
});
