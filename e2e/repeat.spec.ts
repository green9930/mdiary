import { expect, type Page, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

// 다른 테스트가 쓰지 않는 2034년을 쓴다. 계속 반복은 이 해 안에서만 행이 생긴다

const fillRequired = async (page: Page, date: string, title: string) => {
  // 화면이 동작하기 전에 입력하면 값이 사라진다
  await page.goto(`/expenses/new?date=${date}`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "제목" }).fill(title);
  await page.getByRole("button", { name: "생활" }).click();
};

const save = async (page: Page) => {
  await page.getByRole("button", { name: "저장" }).click();
  const alert = page.getByRole("alertdialog", { name: "저장 완료" });
  await alert.getByRole("button", { name: "확인" }).click();
  await expect(alert).toBeHidden();
};

const repeatOption = (page: Page, name: string) =>
  page.getByRole("radiogroup", { name: "반복" }).getByRole("radio", { name });

test.describe("반복 등록 (화면 명세 SC-06 반복 입력, 데이터 아키텍처 5-2·5-4)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("할부 총액으로 등록하면 매달 회차가 생기고, 없는 날은 말일이다", async ({
    page,
  }) => {
    await fillRequired(page, "2034-01-31", "반복 노트북");
    await repeatOption(page, "할부").click();
    await page.getByRole("radio", { name: "총액" }).click();
    await page.getByRole("textbox", { name: "회차" }).fill("3");
    await page.getByRole("textbox", { name: "총액" }).fill("100000");
    await expect(
      page.getByText("1회차 33,334원 · 2~3회차 33,333원"),
    ).toBeVisible();
    await save(page);

    await page.goto("/?month=2034-02&date=2034-02-28");
    const item = page.getByRole("button", { name: /반복 노트북/ });
    await expect(item).toContainText("할부 2/3");
    await expect(item).toContainText("33,333원");
  });

  test("계속 반복은 뒤 달을 열 때 그 달까지 이어서 만든다", async ({
    page,
  }) => {
    await fillRequired(page, "2034-05-31", "반복 월세");
    await page.getByRole("textbox", { name: "금액" }).fill("500000");
    await repeatOption(page, "정기지출").click();
    await expect(page.getByText("매달 31일 · 계속")).toBeVisible();
    await expect(page.getByText("없는 달은 말일로 기록됩니다.")).toBeVisible();
    await save(page);

    await page.goto("/?month=2034-09&date=2034-09-30");
    const item = page.getByRole("button", { name: /반복 월세/ });
    await expect(item).toContainText("정기");
    await expect(item).toContainText("500,000원");
  });
});
