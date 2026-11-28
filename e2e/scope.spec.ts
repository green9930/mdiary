import { expect, type Page, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

// 다른 테스트가 쓰지 않는 2035년을 쓴다

const createSeries = async (
  page: Page,
  date: string,
  title: string,
  repeat: Record<string, unknown>,
) => {
  const response = await page.request.post("/api/expenses", {
    data: {
      date,
      title,
      category: "LIVING",
      amount: 30000,
      content: null,
      repeat,
    },
  });
  expect(response.ok()).toBe(true);
};

// 하루 목록이 보이면 화면이 동작할 준비가 된 것이다
const gotoDay = async (page: Page, date: string) => {
  await page.goto(`/?month=${date.slice(0, 7)}&date=${date}`);
  await expect(page.getByText(/^\d+건/)).toBeVisible();
};

const dayItem = (page: Page, title: string) =>
  page.getByRole("button", { name: new RegExp(title) });

test.describe("반복 범위 수정·삭제 (화면 명세 SC-09, 데이터 아키텍처 5-3·5-5)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("날짜를 뒤 달로 바꿔 이후 전체를 저장하면 이 건부터 밀린다", async ({
    page,
  }) => {
    test.slow();
    await createSeries(page, "2035-01-10", "범위 관리비", {
      type: "recurring",
      months: 6,
    });
    await gotoDay(page, "2035-03-10");
    await dayItem(page, "범위 관리비").click();
    await page
      .getByRole("dialog", { name: "기록 상세" })
      .getByRole("button", { name: "수정" })
      .click();
    await expect(page).toHaveURL(/\/edit$/);

    await page.getByRole("button", { name: /^날짜/ }).click();
    const picker = page.getByRole("dialog", { name: "날짜 선택" });
    await picker.getByRole("button", { name: "다음 달" }).click();
    await picker.getByRole("button", { name: "2035년 4월 5일 (목)" }).click();
    await picker.getByRole("button", { name: "선택", exact: true }).click();
    await page.getByRole("button", { name: "저장" }).click();

    const scope = page.getByRole("dialog", { name: "반복 기록 수정" });
    await expect(
      scope.getByRole("radio", { name: "이 건부터" }),
    ).toBeDisabled();
    await expect(
      scope.getByText(
        "날짜의 달을 바꾸면 이 건부터 N개월은 선택할 수 없습니다.",
      ),
    ).toBeVisible();
    await scope.locator("label", { hasText: "이후 전체" }).click();
    await expect(
      scope.getByText("2035년 4월 ~ 2035년 7월 (4건)"),
    ).toBeVisible();
    await scope.getByRole("button", { name: "저장" }).click();
    await expect(page).not.toHaveURL(/\/edit$/);

    await gotoDay(page, "2035-07-05");
    await expect(dayItem(page, "범위 관리비")).toBeVisible();
    await gotoDay(page, "2035-02-10");
    await expect(dayItem(page, "범위 관리비")).toBeVisible();
  });

  test("상세의 [삭제]에서 이 건부터 N개월을 지운다", async ({ page }) => {
    await createSeries(page, "2035-11-15", "범위 노트북", {
      type: "installment",
      count: 3,
      basis: "perCount",
    });
    await gotoDay(page, "2035-12-15");
    await dayItem(page, "범위 노트북").click();
    const sheet = page.getByRole("dialog", { name: "기록 상세" });
    await sheet.getByRole("button", { name: "삭제" }).click();

    const scope = page.getByRole("dialog", { name: "반복 기록 삭제" });
    await expect(scope.getByText("2035년 12월 15일 1건")).toBeVisible();
    await scope.locator("label", { hasText: "이 건부터" }).click();
    await scope.getByRole("textbox", { name: "개월 수" }).fill("1");
    await expect(
      scope.getByText("2035년 12월 ~ 2035년 12월 (1건)"),
    ).toBeVisible();
    await scope.getByRole("button", { name: "삭제" }).click();

    const confirm = page.getByRole("alertdialog", { name: "삭제하기" });
    await expect(confirm).toHaveAccessibleDescription(
      "1건을 삭제하시겠습니까?",
    );
    await confirm.getByRole("button", { name: "삭제" }).click();
    await expect(scope).toBeHidden();
    await expect(dayItem(page, "범위 노트북")).toBeHidden();

    await gotoDay(page, "2036-01-15");
    await expect(dayItem(page, "범위 노트북")).toContainText("할부 3/3");
  });
});
