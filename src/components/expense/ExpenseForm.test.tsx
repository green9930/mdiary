import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExpenseForm from "@/components/expense/ExpenseForm";
import { resetInAppHistory } from "@/hooks/useGoBack";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import { createQueryClient } from "@/states/tanstackQuery/queryClient";

const router = vi.hoisted(() => ({ back: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/expenses/new",
}));

const TITLES = [
  {
    title: "쿠팡",
    uses: 5,
    lastUsedAt: "2026-10-17T00:00:00.000Z",
    lastCategory: "LIVING",
  },
  {
    title: "쿠팡이츠",
    uses: 3,
    lastUsedAt: "2026-10-16T00:00:00.000Z",
    lastCategory: "FOOD",
  },
  {
    title: "점심",
    uses: 2,
    lastUsedAt: "2026-10-15T00:00:00.000Z",
    lastCategory: "FOOD",
  },
];

interface Server {
  save?: () => Response | Promise<Response>;
  update?: () => Response;
}

// /api/titles는 TITLES, POST /api/expenses는 save (기본: 성공)
const mockServer = ({ save, update }: Server = {}) =>
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    if (url === "/api/titles") return Response.json({ titles: TITLES });
    if (url === "/api/expenses" && init?.method === "POST") {
      if (save) return save();
      const body = JSON.parse(String(init.body)) as { date: string };
      return Response.json({ id: "e1", date: body.date }, { status: 201 });
    }
    if (url.startsWith("/api/expenses/") && init?.method === "PATCH")
      return update?.() ?? Response.json({ updated: 1 });
    throw new Error(`unexpected ${url}`);
  });

const renderForm = () => {
  const client = createQueryClient({ onUnauthorized: () => {} });
  client.setDefaultOptions({ queries: { retry: false } });
  return render(
    <QueryClientProvider client={client}>
      <ExpenseForm initialDate="2026-10-18" today="2026-10-21" />
    </QueryClientProvider>,
  );
};

const titleInput = () => screen.getByRole("textbox", { name: "제목" });
const amountInput = () => screen.getByRole("textbox", { name: "금액" });
const contentInput = () => screen.getByRole("textbox", { name: "내용 (선택)" });
const dateButton = (date: string) =>
  screen.getByRole("button", { name: `날짜 ${date}` });
const saveButton = () => screen.getByRole("button", { name: "저장" });
const dialog = (name: string) =>
  screen.getByRole("alertdialog", { name, hidden: true });
const postBodies = (fetch: ReturnType<typeof mockServer>) =>
  fetch.mock.calls
    .filter(([, init]) => init?.method === "POST")
    .map(([, init]) => JSON.parse(String(init?.body)) as unknown);

const fillValid = async () => {
  await userEvent.type(titleInput(), "점심 김밥");
  await userEvent.click(screen.getByRole("button", { name: "식비" }));
  await userEvent.type(amountInput(), "8000");
};

beforeEach(async () => {
  vi.clearAllMocks();
  resetInAppHistory();
  // 앞 테스트가 화면을 지우며 되돌린 기록의 popstate가 다 도착한 뒤 비운다
  await new Promise((resolve) => setTimeout(resolve, 20));
  resetHistoryLayers();
});

afterEach(() => vi.restoreAllMocks());

describe("ExpenseForm (화면 명세 SC-06 등록)", () => {
  describe("처음 화면", () => {
    it("받은 날짜를 보여 주고 나머지는 비어 있다", () => {
      mockServer();
      renderForm();
      expect(dateButton("2026년 10월 18일 (일)")).toBeInTheDocument();
      expect(titleInput()).toHaveValue("");
      expect(amountInput()).toHaveValue("");
      expect(contentInput()).toHaveValue("");
      expect(saveButton()).toBeEnabled();
    });
  });

  describe("폼 검증 (공통 규약 · 입력)", () => {
    it("빈 폼에서 [저장]을 누르면 필드 오류를 모두 보여 주고 첫 오류 칸(제목)으로 포커스한다", async () => {
      const fetch = mockServer();
      renderForm();

      await userEvent.click(saveButton());

      expect(titleInput()).toHaveAccessibleDescription("제목을 입력해 주세요.");
      expect(
        screen.getByRole("group", { name: "카테고리" }),
      ).toHaveAccessibleDescription("카테고리를 선택해 주세요.");
      expect(amountInput()).toHaveAccessibleDescription(
        "금액을 입력해 주세요.",
      );
      expect(titleInput()).toHaveFocus();
      expect(postBodies(fetch)).toEqual([]);
    });

    it("첫 오류 칸이 금액이면 금액으로 포커스한다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "점심");
      await userEvent.click(screen.getByRole("button", { name: "식비" }));

      await userEvent.click(saveButton());

      expect(amountInput()).toHaveFocus();
    });

    it("칸을 벗어나면 그 칸을 검증한다", async () => {
      mockServer();
      renderForm();

      await userEvent.click(titleInput());
      await userEvent.tab();

      expect(titleInput()).toHaveAccessibleDescription("제목을 입력해 주세요.");
    });

    it("입력 중에는 오류를 지우기만 하고, 다시 벗어날 때 검증한다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(saveButton());

      await userEvent.type(titleInput(), "점");
      expect(titleInput()).not.toHaveAccessibleDescription();

      await userEvent.clear(titleInput());
      expect(titleInput()).not.toHaveAccessibleDescription();

      await userEvent.tab();
      expect(titleInput()).toHaveAccessibleDescription("제목을 입력해 주세요.");
    });

    it("공백만 넣은 제목은 빈칸으로 본다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "   ");
      await userEvent.tab();
      expect(titleInput()).toHaveAccessibleDescription("제목을 입력해 주세요.");
    });

    it("카테고리를 고르면 카테고리 오류를 지운다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(saveButton());

      await userEvent.click(screen.getByRole("button", { name: "교통" }));

      expect(
        screen.getByRole("group", { name: "카테고리" }),
      ).not.toHaveAccessibleDescription();
    });
  });

  describe("금액", () => {
    it("입력 중 쉼표를 넣고, 숫자만 받는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(amountInput(), "12a000");
      expect(amountInput()).toHaveValue("12,000");
    });

    it("붙여넣기는 숫자만 골라내고 맨 앞 0을 지운다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(amountInput());
      await userEvent.paste("012,000원");
      expect(amountInput()).toHaveValue("12,000");
    });

    it("9자리를 넘는 입력은 막는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(amountInput(), "1234567890");
      expect(amountInput()).toHaveValue("123,456,789");
    });

    it("0만 넣으면 빈칸이다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(amountInput(), "0");
      expect(amountInput()).toHaveValue("");
    });
  });

  describe("저장", () => {
    it("검증을 통과하면 등록하고, 화면을 옮기지 않고 저장 완료 알림을 띄운다", async () => {
      const fetch = mockServer();
      renderForm();
      await fillValid();
      await userEvent.type(contentInput(), "참치김밥");

      await userEvent.click(saveButton());

      const alert = await waitFor(() => dialog("저장 완료"));
      expect(alert).toHaveAccessibleDescription("기록을 저장했습니다.");
      expect(router.replace).not.toHaveBeenCalled();
      expect(postBodies(fetch)).toEqual([
        {
          date: "2026-10-18",
          title: "점심 김밥",
          category: "FOOD",
          amount: 8000,
          content: "참치김밥",
          repeat: { type: "none" },
        },
      ]);
    });

    it("내용이 비었으면 null로 보낸다", async () => {
      const fetch = mockServer();
      renderForm();
      await fillValid();

      await userEvent.click(saveButton());

      await waitFor(() => dialog("저장 완료"));
      expect(postBodies(fetch)[0]).toMatchObject({ content: null });
    });

    it("저장 완료 알림의 [확인]은 모든 입력을 처음 값으로 되돌리고 제목 칸에 포커스한다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(dateButton("2026년 10월 18일 (일)"));
      await userEvent.click(
        screen.getByRole("button", {
          name: "2026년 10월 25일 (일)",
          hidden: true,
        }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "선택", hidden: true }),
      );
      await fillValid();
      await userEvent.type(contentInput(), "참치김밥");
      await userEvent.click(saveButton());

      await userEvent.click(
        within(await waitFor(() => dialog("저장 완료"))).getByRole("button", {
          name: "확인",
          hidden: true,
        }),
      );

      expect(
        document.querySelector("dialog[role=alertdialog][open]"),
      ).toBeNull();
      expect(dateButton("2026년 10월 18일 (일)")).toBeInTheDocument();
      expect(titleInput()).toHaveValue("");
      expect(screen.getByRole("button", { name: "식비" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      expect(amountInput()).toHaveValue("");
      expect(contentInput()).toHaveValue("");
      expect(titleInput()).toHaveFocus();
      expect(saveButton()).toBeEnabled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("저장 완료 알림의 [확인] 뒤에는 알림이 쌓은 기록을 되돌린다", async () => {
      mockServer();
      renderForm();
      const startState: unknown = window.history.state;
      await fillValid();
      await userEvent.click(saveButton());
      await waitFor(() =>
        expect(window.history.state).toHaveProperty("mdiaryLayer"),
      );

      await userEvent.click(
        within(await waitFor(() => dialog("저장 완료"))).getByRole("button", {
          name: "확인",
          hidden: true,
        }),
      );

      await waitFor(() => expect(window.history.state).toEqual(startState));
      await waitFor(() => expect(titleInput()).toHaveValue(""));
    });

    it("저장한 뒤 처음 값으로 돌아오면 [뒤로]는 바로 이전 화면으로 간다", async () => {
      mockServer();
      renderForm();
      await fillValid();
      await userEvent.click(saveButton());
      await userEvent.click(
        within(await waitFor(() => dialog("저장 완료"))).getByRole("button", {
          name: "확인",
          hidden: true,
        }),
      );

      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));

      expect(router.replace).toHaveBeenCalledWith("/");
    });

    it("요청 중에는 [저장]과 [뒤로]를 막는다", async () => {
      let respond: (response: Response) => void = () => {};
      mockServer({
        save: () =>
          new Promise<Response>((resolve) => {
            respond = resolve;
          }),
      });
      renderForm();
      await fillValid();

      await userEvent.click(saveButton());

      expect(saveButton()).toBeDisabled();
      expect(saveButton()).toHaveAttribute("aria-busy", "true");
      expect(screen.getByRole("button", { name: "뒤로" })).toBeDisabled();
      respond(Response.json({ id: "e1", date: "2026-10-18" }, { status: 201 }));
      await waitFor(() => dialog("저장 완료"));
    });

    it("저장에 실패하면 알림 다이얼로그를 띄우고 입력값을 그대로 둔다", async () => {
      mockServer({
        save: () => Response.json({ code: "INTERNAL" }, { status: 500 }),
      });
      renderForm();
      await fillValid();

      await userEvent.click(saveButton());

      const alert = await waitFor(() => dialog("저장하기"));
      expect(alert).toHaveAccessibleDescription(
        "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      await userEvent.click(
        within(alert).getByRole("button", { name: "확인", hidden: true }),
      );
      expect(titleInput()).toHaveValue("점심 김밥");
      expect(amountInput()).toHaveValue("8,000");
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("자주 쓴 제목 추천", () => {
    const suggestionList = () => screen.queryByRole("listbox");

    it("입력하면 일치하는 제목을 제목·마지막 카테고리와 함께 보여 준다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "쿠");

      const list = await screen.findByRole("listbox");
      expect(
        within(list)
          .getAllByRole("option")
          .map((o) => o.textContent),
      ).toEqual(["쿠팡", "쿠팡이츠"]);
    });

    it("치는 도중의 글자와 초성으로도 찾는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "ㅈㅅ");
      expect(
        within(await screen.findByRole("listbox")).getByRole("option"),
      ).toHaveTextContent("점심");
    });

    it("고르면 제목과 그 제목의 마지막 카테고리를 채우고 목록을 닫는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "쿠");

      await userEvent.click(
        await screen.findByRole("option", { name: "쿠팡이츠" }),
      );

      expect(titleInput()).toHaveValue("쿠팡이츠");
      expect(screen.getByRole("button", { name: "식비" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(suggestionList()).not.toBeInTheDocument();
    });

    it("카테고리를 이미 골랐으면 바꾸지 않는다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(screen.getByRole("button", { name: "교통" }));
      await userEvent.type(titleInput(), "쿠");

      await userEvent.click(
        await screen.findByRole("option", { name: "쿠팡" }),
      );

      expect(screen.getByRole("button", { name: "교통" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("입력칸을 벗어나면 닫는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "쿠");
      await screen.findByRole("listbox");

      await userEvent.tab();

      expect(suggestionList()).not.toBeInTheDocument();
    });

    it("일치하는 제목이 없으면 보이지 않는다", async () => {
      mockServer();
      renderForm();
      await screen.findByRole("textbox", { name: "제목" });
      await userEvent.type(titleInput(), "택시");
      expect(suggestionList()).not.toBeInTheDocument();
    });
  });

  describe("계산기 (SC-07)", () => {
    it("[계산]은 금액 값으로 계산기를 열고, [적용]하면 금액과 내용에 넣는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(amountInput(), "36000");
      await userEvent.type(contentInput(), "회식");

      await userEvent.click(screen.getByRole("button", { name: "계산" }));
      const key = (name: string) =>
        screen.getByRole("button", { name, hidden: true });
      await userEvent.click(key("÷"));
      await userEvent.click(key("3"));
      await userEvent.click(key("적용"));

      expect(amountInput()).toHaveValue("12,000");
      expect(contentInput()).toHaveValue("회식\n36,000 ÷ 3 = 12,000");
    });

    it("적용한 금액은 금액 오류를 지운다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(saveButton());
      expect(screen.getByText("금액을 입력해 주세요.")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "계산" }));
      await userEvent.keyboard("500{Enter}");

      expect(amountInput()).toHaveValue("500");
      expect(
        screen.queryByText("금액을 입력해 주세요."),
      ).not.toBeInTheDocument();
    });
  });

  describe("날짜", () => {
    it("날짜를 누르면 날짜 선택 시트가 열리고, 고른 날짜로 바뀐다", async () => {
      mockServer();
      renderForm();

      await userEvent.click(dateButton("2026년 10월 18일 (일)"));
      await userEvent.click(
        screen.getByRole("button", {
          name: "2026년 10월 25일 (일)",
          hidden: true,
        }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: "선택", hidden: true }),
      );

      expect(dateButton("2026년 10월 25일 (일)")).toBeInTheDocument();
    });
  });

  describe("작성 중 나가기", () => {
    it("입력한 내용이 없으면 [뒤로]는 바로 이전 화면으로 간다", async () => {
      mockServer();
      renderForm();
      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));
      expect(router.replace).toHaveBeenCalledWith("/");
      expect(document.querySelector("dialog[open]")).toBeNull();
    });

    it("입력해도 기록을 쌓지 않는다 (브라우저·기기 뒤로 가기는 확인 없이 이전 화면으로 간다)", async () => {
      mockServer();
      renderForm();
      const startState: unknown = window.history.state;

      await userEvent.type(contentInput(), "메모");
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(window.history.state).toEqual(startState);
    });

    it("입력한 내용이 있으면 [뒤로]는 확인 다이얼로그를 띄운다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(contentInput(), "메모");

      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));

      expect(dialog("작성 취소")).toHaveAccessibleDescription(
        "작성 중인 내용이 사라집니다. 나가시겠습니까?",
      );
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("[계속 작성]은 다이얼로그만 닫는다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(contentInput(), "메모");
      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));

      await userEvent.click(
        within(dialog("작성 취소")).getByRole("button", {
          name: "계속 작성",
          hidden: true,
        }),
      );

      expect(document.querySelector("dialog[open]")).toBeNull();
      expect(contentInput()).toHaveValue("메모");
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("[나가기]는 이전 화면으로 간다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(contentInput(), "메모");
      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));

      await userEvent.click(
        within(dialog("작성 취소")).getByRole("button", {
          name: "나가기",
          hidden: true,
        }),
      );

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    });

    it("입력했다가 처음 값으로 되돌리면 입력한 내용이 없는 것으로 본다", async () => {
      mockServer();
      renderForm();
      await userEvent.type(titleInput(), "점");
      await userEvent.clear(titleInput());

      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));

      expect(router.replace).toHaveBeenCalledWith("/");
    });
  });

  describe("수정 (SC-06 수정)", () => {
    const original = {
      id: "e1",
      date: "2026-10-18",
      title: "점심",
      category: "FOOD" as const,
      amount: 8000,
      content: "참치김밥",
    };

    const renderEdit = () => {
      const client = createQueryClient({ onUnauthorized: () => {} });
      client.setDefaultOptions({ queries: { retry: false } });
      return render(
        <QueryClientProvider client={client}>
          <ExpenseForm
            initialDate={original.date}
            today="2026-10-21"
            editing={original}
          />
        </QueryClientProvider>,
      );
    };

    const patchBodies = (fetch: ReturnType<typeof mockServer>) =>
      fetch.mock.calls
        .filter(([, init]) => init?.method === "PATCH")
        .map(([, init]) => JSON.parse(String(init?.body)) as unknown);

    it("제목은 수정하기이고 원래 값을 채워서 연다", () => {
      mockServer();
      renderEdit();

      expect(
        screen.getByRole("heading", { name: "수정하기" }),
      ).toBeInTheDocument();
      expect(dateButton("2026년 10월 18일 (일)")).toBeInTheDocument();
      expect(titleInput()).toHaveValue("점심");
      expect(screen.getByRole("button", { name: "식비" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(amountInput()).toHaveValue("8,000");
      expect(contentInput()).toHaveValue("참치김밥");
    });

    it("바꾼 필드만 보내고, 저장하면 이전 화면으로 간다", async () => {
      const fetch = mockServer();
      renderEdit();
      await userEvent.clear(titleInput());
      await userEvent.type(titleInput(), "저녁");

      await userEvent.click(saveButton());

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
      expect(patchBodies(fetch)).toEqual([
        { title: "저녁", scope: { type: "one" } },
      ]);
      expect(document.querySelector("dialog[open]")).toBeNull();
    });

    it("바꾼 것이 없으면 요청 없이 이전 화면으로 간다", async () => {
      const fetch = mockServer();
      renderEdit();

      await userEvent.click(saveButton());

      expect(router.replace).toHaveBeenCalledWith("/");
      expect(patchBodies(fetch)).toEqual([]);
    });

    it("원래 값과 같으면 [뒤로]는 확인 없이 나간다", async () => {
      mockServer();
      renderEdit();

      await userEvent.click(screen.getByRole("button", { name: "뒤로" }));

      expect(router.replace).toHaveBeenCalledWith("/");
    });

    it("저장하려는데 이미 없으면 기록 없음 알림 뒤 달력으로 간다", async () => {
      mockServer({
        update: () => Response.json({ code: "NOT_FOUND" }, { status: 404 }),
      });
      renderEdit();
      await userEvent.type(titleInput(), "!");
      await userEvent.click(saveButton());

      await userEvent.click(
        within(await waitFor(() => dialog("기록 없음"))).getByRole("button", {
          name: "확인",
          hidden: true,
        }),
      );

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
    });

    it("저장에 실패하면 알림을 띄우고 입력값을 둔다", async () => {
      mockServer({
        update: () => Response.json({ code: "INTERNAL" }, { status: 500 }),
      });
      renderEdit();
      await userEvent.type(titleInput(), "!");
      await userEvent.click(saveButton());

      await waitFor(() =>
        expect(dialog("저장하기")).toHaveAccessibleDescription(
          "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      );
      expect(titleInput()).toHaveValue("점심!");
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});
