import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

test.describe("공통 컴포넌트 견본 (F0-2)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/dev/components");
  });

  test("견본 화면이 열린다", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "공통 컴포넌트" }),
    ).toBeVisible();
  });

  test("입력 한도·숫자 입력이 실제 브라우저에서도 동작한다", async ({
    page,
  }) => {
    const title = page.getByLabel("제목", { exact: true });
    await title.fill("가".repeat(30));
    await expect(title).toHaveValue("가".repeat(25));

    const months = page.getByLabel("기간", { exact: true });
    await months.pressSequentially("0a123");
    await expect(months).toHaveValue("12");
  });

  test("라벨을 눌러도 체크박스·라디오가 바뀐다", async ({ page }) => {
    await page.getByText("위 내용을 확인했습니다").click();
    await expect(
      page.getByRole("checkbox", { name: "위 내용을 확인했습니다" }),
    ).toBeChecked();

    await page.getByText("이후 전체").click();
    await expect(page.getByRole("radio", { name: "이후 전체" })).toBeChecked();
  });
});
