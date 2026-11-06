import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

test.describe("레이아웃과 하단 탭 바 (화면 명세 SC-01)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("탭으로 화면을 옮기고, 현재 탭을 강조한다", async ({ page }) => {
    await page.goto("/");
    const tabs = page.getByRole("navigation", { name: "주요 화면" });

    for (const [name, path] of [
      ["카테고리", "/categories"],
      ["검색", "/search"],
      ["설정", "/settings"],
      ["달력", "/"],
    ] as const) {
      await tabs.getByRole("link", { name }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { name })).toBeVisible();
      await expect(tabs.getByRole("link", { name })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  test("＋ 버튼은 등록 화면을 열고, 등록 화면에는 탭 바가 없다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "기록하기" }).click();
    await expect(page).toHaveURL(/\/expenses\/new\?date=\d{4}-\d{2}-\d{2}$/);
    await expect(page.getByRole("heading", { name: "기록하기" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "주요 화면" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "뒤로" }).click();
    await expect(page).toHaveURL("/");
  });

  test("등록 화면에 주소로 바로 들어오면 [뒤로]는 앱 밖이 아니라 달력으로 간다", async ({
    page,
  }) => {
    await page.goto("about:blank");
    await page.goto("/expenses/new");
    await page.getByRole("button", { name: "뒤로" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "달력" })).toBeVisible();
  });

  test("로그인 화면에는 탭 바가 없다", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await expect(
      page.getByRole("navigation", { name: "주요 화면" }),
    ).toHaveCount(0);
  });
});

test.describe("화면 모드 (SC-10)", () => {
  test("쿠키의 화면 모드를 첫 화면부터 html에 적용한다", async ({ page }) => {
    await page
      .context()
      .addCookies([
        { name: "theme", value: "dark", url: "http://localhost:3100" },
      ]);
    await page.goto("/login");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("값이 없으면 시스템 설정을 따른다 (data-theme 없음)", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  });
});
