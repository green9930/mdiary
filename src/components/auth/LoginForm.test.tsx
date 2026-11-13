import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginForm from "@/components/auth/LoginForm";
import { authClient } from "@/lib/authClient";
import { BTN_TEXTS, LOGIN_TEXTS } from "@/shared/sharedConstants";

vi.mock("@/lib/authClient", () => ({
  authClient: { signIn: { social: vi.fn() } },
}));

const signIn = vi.mocked(authClient.signIn.social);
const button = () =>
  screen.getByRole("button", { name: BTN_TEXTS.googleSignIn });

describe("LoginForm (화면 명세 SC-02)", () => {
  beforeEach(() => {
    signIn.mockReset();
  });

  it("Google 로그인을 시작하고, 성공하면 next로, 실패하면 reason=failed로 돌아오게 한다", async () => {
    signIn.mockReturnValue(new Promise(() => {}));
    render(<LoginForm next="/search?q=커피" notice={null} />);

    await userEvent.click(button());

    expect(signIn).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/search?q=커피",
      errorCallbackURL:
        "/login?next=%2Fsearch%3Fq%3D%EC%BB%A4%ED%94%BC&reason=failed",
    });
    expect(button()).toHaveAttribute("aria-busy", "true");
  });

  it("들어온 이유의 안내 문구를 보여 주고, 버튼을 누르면 지운다", async () => {
    signIn.mockReturnValue(new Promise(() => {}));
    render(
      <LoginForm
        next="/"
        notice={{ text: LOGIN_TEXTS.expired, tone: "info" }}
      />,
    );
    expect(screen.getByText(LOGIN_TEXTS.expired)).toBeInTheDocument();

    await userEvent.click(button());

    expect(screen.queryByText(LOGIN_TEXTS.expired)).not.toBeInTheDocument();
  });

  it("요청이 실패하면 실패 문구를 보여 주고 버튼을 다시 연다", async () => {
    signIn.mockResolvedValue({ data: null, error: { status: 500 } } as never);
    render(<LoginForm next="/" notice={null} />);

    await userEvent.click(button());

    expect(await screen.findByText(LOGIN_TEXTS.failed)).toBeInTheDocument();
    expect(button()).toBeEnabled();
    expect(button()).not.toHaveAttribute("aria-busy");
  });

  it("네트워크 오류로 요청이 던져도 실패 문구를 보여 준다", async () => {
    signIn.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<LoginForm next="/" notice={null} />);

    await userEvent.click(button());

    expect(await screen.findByText(LOGIN_TEXTS.failed)).toBeInTheDocument();
  });

  it("Google 화면에서 뒤로 가기로 돌아오면 문구 없이 버튼을 다시 연다", async () => {
    signIn.mockReturnValue(new Promise(() => {}));
    render(<LoginForm next="/" notice={null} />);
    await userEvent.click(button());
    expect(button()).toHaveAttribute("aria-busy", "true");

    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(button()).not.toHaveAttribute("aria-busy");
    expect(screen.queryByText(LOGIN_TEXTS.failed)).not.toBeInTheDocument();
  });
});
