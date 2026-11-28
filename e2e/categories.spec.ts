import { expect, type Page, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

// 다른 테스트가 쓰지 않는 2036년을 쓴다

const create = async (
  page: Page,
  date: string,
  category: string,
  amount: number,
) => {
  const response = await page.request.post("/api/expenses", {
    data: {
      date,
      title: "카테고리 기록",
      category,
      amount,
      content: null,
      repeat: { type: "none" },
    },
  });
  expect(response.ok()).toBe(true);
};

test.describe("카테고리별 (화면 명세 SC-04)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("기간의 요약·비중을 보여주고, 그래프 줄로 필터하며 주소에 남는다", async ({
    page,
  }) => {
    await create(page, "2036-01-10", "FOOD", 30000);
    await create(page, "2036-02-10", "LIVING", 70000);
    await create(page, "2036-04-01", "FOOD", 5000); // 기간 밖

    await page.goto("/categories?from=2036-01&to=2036-03&sort=latest");
    await expect(
      page.getByRole("button", { name: "기간: 2036년 1월 ~ 2036년 3월" }),
    ).toBeVisible();
    await expect(page.getByText("총지출 · 2건")).toBeVisible();
    await expect(
      page.getByRole("list", { name: "카테고리별 비중" }),
    ).toHaveText(/생활70\.0%70,000원식비30\.0%30,000원/);

    await page.getByRole("button", { name: /^식비/ }).click();
    await expect(page).toHaveURL(/category=food/);
    await expect(page.getByRole("button", { name: /^식비/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await page.reload();
    await expect(page.getByRole("button", { name: /^식비/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("기간 선택 시트로 기간을 바꾸고, 60개월을 넘으면 [적용]을 막는다", async ({
    page,
  }) => {
    await page.goto("/categories?from=2036-01&to=2036-03&sort=latest");
    await page.getByRole("button", { name: "기간 선택" }).click();
    const sheet = page.getByRole("dialog", { name: "기간 선택" });
    await sheet.getByRole("radio", { name: /^끝/ }).click();
    await sheet.getByRole("button", { name: "6월", exact: true }).click();
    await sheet.getByRole("button", { name: "적용" }).click();
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/from=2036-01&to=2036-06/);

    await page.getByRole("button", { name: "기간 선택" }).click();
    await sheet.getByRole("radio", { name: /^끝/ }).click();
    for (let i = 0; i < 5; i += 1)
      await sheet.getByRole("button", { name: "다음 해" }).click();
    await sheet.getByRole("button", { name: "1월", exact: true }).click();
    await expect(
      sheet.getByText("최대 5년까지 조회할 수 있습니다."),
    ).toBeVisible();
    await expect(sheet.getByRole("button", { name: "적용" })).toBeDisabled();
  });

  test("잘못된 쿼리는 기본값(이번 달)으로 주소를 바꾼다", async ({ page }) => {
    await page.goto("/categories?from=2036-05&to=2036-01&sort=latest");
    await expect(page).toHaveURL(/from=\d{4}-\d{2}&to=\d{4}-\d{2}&sort=latest/);
    await expect(
      page.getByRole("button", { name: "기간: 이번 달" }),
    ).toBeVisible();
  });
});
