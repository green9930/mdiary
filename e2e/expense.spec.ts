import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

test.describe("지출 등록 (화면 명세 SC-06, 반복 없음)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("입력해 저장하면 저장 완료 알림 뒤 폼을 비우고, 뒤로 가기로 들어오기 전 화면에 간다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "기록하기" }).click();
    await expect(page).toHaveURL(/\/expenses\/new/);

    await page.getByRole("textbox", { name: "제목" }).fill("점심 김밥");
    await page.getByRole("button", { name: "식비" }).click();
    await page.getByRole("textbox", { name: "금액" }).fill("8000");
    await expect(page.getByRole("textbox", { name: "금액" })).toHaveValue(
      "8,000",
    );
    await page.getByRole("button", { name: "저장" }).click();

    const alert = page.getByRole("alertdialog", { name: "저장 완료" });
    await expect(alert).toHaveAccessibleDescription("기록을 저장했습니다.");
    await alert.getByRole("button", { name: "확인" }).click();
    await expect(alert).toBeHidden();
    await expect(page).toHaveURL(/\/expenses\/new/);
    await expect(page.getByRole("textbox", { name: "제목" })).toHaveValue("");
    await expect(page.getByRole("textbox", { name: "제목" })).toBeFocused();

    await page.goBack();
    await expect(page).toHaveURL("/");
  });

  test("빈 폼에서 저장하면 필드 오류를 보여 주고 저장하지 않는다", async ({
    page,
  }) => {
    await page.goto("/expenses/new");
    await page.getByRole("button", { name: "저장" }).click();

    await expect(page.getByText("제목을 입력해 주세요.")).toBeVisible();
    await expect(page.getByText("카테고리를 선택해 주세요.")).toBeVisible();
    await expect(page.getByText("금액을 입력해 주세요.")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "제목" })).toBeFocused();
    await expect(page).toHaveURL("/expenses/new");
  });

  test("작성 중 브라우저 뒤로 가기는 확인 없이 이전 화면으로 간다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "기록하기" }).click();
    await page.getByRole("textbox", { name: "제목" }).fill("커피");

    await page.goBack();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("alertdialog", { name: "작성 취소" }),
    ).toBeHidden();
  });

  test("작성 중 [뒤로]는 확인 다이얼로그를 띄우고, [나가기]로 이전 화면에 간다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "기록하기" }).click();
    await page.getByRole("textbox", { name: "제목" }).fill("커피");
    const back = page.getByRole("button", { name: "뒤로" });
    const dialog = page.getByRole("alertdialog", { name: "작성 취소" });

    await back.click();
    await expect(dialog).toBeVisible();
    // 다이얼로그는 버튼으로만 닫힌다: 브라우저 뒤로 가기는 무시한다
    await page.goBack();
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/expenses\/new/);

    await dialog.getByRole("button", { name: "계속 작성" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("textbox", { name: "제목" })).toHaveValue(
      "커피",
    );

    await back.click();
    await dialog.getByRole("button", { name: "나가기" }).click();
    await expect(page).toHaveURL("/");
  });

  test("2번 이상 쓴 제목을 추천하고, 고르면 마지막 카테고리를 채운다", async ({
    page,
  }) => {
    const title = `추천${Date.now().toString(36)}`;
    for (const category of ["LIVING", "TRANSPORT"]) {
      const response = await page.request.post("/api/expenses", {
        data: {
          date: "2026-10-18",
          title,
          category,
          amount: 1000,
          content: null,
          repeat: { type: "none" },
        },
      });
      expect(response.status()).toBe(201);
    }

    await page.goto("/expenses/new");
    await page.getByRole("textbox", { name: "제목" }).fill(title.slice(0, -1));
    await page.getByRole("option", { name: title }).click();

    await expect(page.getByRole("textbox", { name: "제목" })).toHaveValue(
      title,
    );
    await expect(page.getByRole("button", { name: "교통" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
