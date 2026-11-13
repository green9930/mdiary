import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

test.describe("로그인과 세션 (화면 명세 RT)", () => {
  test("세션 없이 들어오면 원래 경로를 담아 로그인으로 보낸다", async ({
    page,
  }) => {
    await page.goto("/calendar?month=2026-10");
    await expect(page).toHaveURL("/login?next=%2Fcalendar%3Fmonth%3D2026-10");
    await expect(
      page.getByRole("button", { name: "Google로 계속하기" }),
    ).toBeVisible();
  });

  test("로그인하면 들어갈 수 있다", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "달력" })).toBeVisible();
  });

  test("로그인한 채로 로그인 화면에 오면 next로 보낸다", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/login?next=%2F");
    await expect(page).toHaveURL("/");
  });

  test.describe("로그인 화면 안내 문구 (SC-02 ③④⑤)", () => {
    for (const [reason, text] of [
      ["expired", "세션이 만료되었습니다. 다시 로그인해 주세요."],
      ["withdrawn", "탈퇴가 완료되었습니다."],
      ["failed", "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."],
    ] as const) {
      test(`reason=${reason}`, async ({ page }) => {
        await page.goto(`/login?next=%2F&reason=${reason}`);
        await expect(page.getByRole("status")).toHaveText(text);
      });
    }
  });

  test("로그인 요청이 실패하면 실패 문구를 보여 주고 버튼을 다시 연다", async ({
    page,
  }) => {
    await page.route("**/api/auth/sign-in/social", (route) => route.abort());
    await page.goto("/login");
    const button = page.getByRole("button", { name: "Google로 계속하기" });

    await button.click();

    await expect(page.getByRole("status")).toHaveText(
      "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    );
    await expect(button).toBeEnabled();
  });

  test("로그아웃하면 로그인 화면으로 가고, 다시 들어가려면 로그인해야 한다", async ({
    page,
  }) => {
    await loginAsTestUser(page);
    await page.goto("/settings");

    await page.getByRole("button", { name: "로그아웃" }).click();

    await expect(page).toHaveURL("/login");
    await page.goto("/settings");
    await expect(page).toHaveURL("/login?next=%2Fsettings");
  });

  test("로그아웃이 실패하면 알림 다이얼로그를 띄우고 설정 화면에 남는다", async ({
    page,
  }) => {
    await loginAsTestUser(page);
    await page.route("**/api/auth/sign-out", (route) =>
      route.fulfill({ status: 500 }),
    );
    await page.goto("/settings");

    await page.getByRole("button", { name: "로그아웃" }).click();

    const alert = page.getByRole("alertdialog", { name: "로그아웃하기" });
    await expect(alert).toBeVisible();
    await alert.getByRole("button", { name: "확인", exact: true }).click();
    await expect(alert).toBeHidden();
    await expect(page).toHaveURL("/settings");
  });
});
