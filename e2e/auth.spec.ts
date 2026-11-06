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
});
