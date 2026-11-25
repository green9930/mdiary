import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

test.describe("계산기 (화면 명세 SC-07)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("금액에서 시작해 나누고 끝전 처리한 결과를 금액과 내용에 넣는다", async ({
    page,
  }) => {
    await page.goto("/expenses/new");
    await page.getByRole("textbox", { name: "금액" }).fill("100000");
    await page.getByRole("button", { name: "계산" }).click();

    const sheet = page.getByRole("dialog", { name: "계산기" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "÷" }).click();
    await sheet.getByRole("button", { name: "3", exact: true }).click();
    await expect(sheet.getByText("33,333.33")).toBeVisible();

    await sheet.getByRole("radio", { name: "10원" }).click();
    await sheet.getByRole("radio", { name: "올림" }).click();
    await expect(sheet.getByText("= 33,340")).toBeVisible();
    await sheet.getByRole("button", { name: "적용" }).click();

    await expect(sheet).toBeHidden();
    await expect(page.getByRole("textbox", { name: "금액" })).toHaveValue(
      "33,340",
    );
    await expect(
      page.getByRole("textbox", { name: "내용 (선택)" }),
    ).toHaveValue("100,000 ÷ 3 = 33,340 (10원 올림)");
  });

  test("적용할 수 없는 식은 이유를 보이고 [적용]을 막는다", async ({
    page,
  }) => {
    await page.goto("/expenses/new");
    await page.getByRole("button", { name: "계산" }).click();

    const sheet = page.getByRole("dialog", { name: "계산기" });
    await page.keyboard.type("36000/0");
    await expect(sheet.getByText("0으로 나눌 수 없습니다.")).toBeVisible();
    await expect(sheet.getByRole("button", { name: "적용" })).toBeDisabled();
  });

  test("뒤로 가기는 적용 없이 닫고 폼에 머문다", async ({ page }) => {
    await page.goto("/expenses/new");
    await page.getByRole("textbox", { name: "금액" }).fill("8000");
    await page.getByRole("button", { name: "계산" }).click();

    const sheet = page.getByRole("dialog", { name: "계산기" });
    await sheet.getByRole("button", { name: "+" }).click();
    await sheet.getByRole("button", { name: "2", exact: true }).click();
    await page.goBack();

    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL("/expenses/new");
    await expect(page.getByRole("textbox", { name: "금액" })).toHaveValue(
      "8,000",
    );
  });
});
