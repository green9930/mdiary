import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignOutButton from "@/components/auth/SignOutButton";
import { resetHistoryLayers } from "@/hooks/useHistoryLayer";
import { authClient } from "@/lib/authClient";
import { hardNavigate } from "@/lib/navigation";
import { BTN_TEXTS, DIALOG_TEXTS, PATHS } from "@/shared/sharedConstants";

vi.mock("@/lib/authClient", () => ({
  authClient: { signOut: vi.fn() },
}));
vi.mock("@/lib/navigation", () => ({ hardNavigate: vi.fn() }));

const signOut = vi.mocked(authClient.signOut);
const button = () => screen.getByRole("button", { name: BTN_TEXTS.signOut });

describe("SignOutButton (화면 명세 SC-10)", () => {
  beforeEach(() => {
    signOut.mockReset();
    vi.mocked(hardNavigate).mockReset();
    resetHistoryLayers();
  });

  it("확인 없이 로그아웃하고 로그인 화면으로 간다", async () => {
    signOut.mockResolvedValue({
      data: { success: true },
      error: null,
    } as never);
    render(<SignOutButton />);

    await userEvent.click(button());

    expect(signOut).toHaveBeenCalledOnce();
    expect(hardNavigate).toHaveBeenCalledWith(PATHS.login);
  });

  it("요청 중에는 누를 수 없다", async () => {
    signOut.mockReturnValue(new Promise(() => {}));
    render(<SignOutButton />);

    await userEvent.click(button());

    expect(button()).toHaveAttribute("aria-busy", "true");
  });

  it.each([
    [
      "오류 응답",
      () =>
        signOut.mockResolvedValue({
          data: null,
          error: { status: 500 },
        } as never),
    ],
    [
      "네트워크 오류",
      () => signOut.mockRejectedValue(new TypeError("Failed to fetch")),
    ],
  ])("%s면 알림 다이얼로그를 띄우고 화면은 그대로 둔다", async (_, arrange) => {
    arrange();
    render(<SignOutButton />);

    await userEvent.click(button());

    const dialog = await screen.findByRole("alertdialog", {
      name: DIALOG_TEXTS.signOutTitle,
      hidden: true,
    });
    expect(dialog).toHaveAccessibleDescription(DIALOG_TEXTS.signOutFailed);
    expect(hardNavigate).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: BTN_TEXTS.confirm, hidden: true }),
    );
    expect(dialog).not.toHaveAttribute("open");
    expect(button()).toBeEnabled();
  });
});
