import { expect, type Page, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

// 바텀시트·다이얼로그·드롭다운의 닫기 규칙 (화면 명세 공통 규약 · 다이얼로그, 바텀시트)
test.describe("겹쳐 뜨는 화면 (F0-2b)", () => {
  const sheet = (page: Page) => page.getByRole("dialog", { name: "기간 선택" });
  const deleteDialog = (page: Page) =>
    page
      .getByRole("alertdialog")
      .filter({ hasText: "이 기록을 삭제하시겠습니까?" });
  // 올라오는 움직임이 끝날 때까지 기다린다 (그 전에는 위치가 계속 바뀐다)
  const openSheet = async (page: Page) => {
    await page.getByRole("button", { name: "시트 열기", exact: true }).click();
    await expect(sheet(page)).not.toHaveAttribute("data-opening");
    await sheet(page).evaluate((el) =>
      Promise.all(el.getAnimations().map((animation) => animation.finished)),
    );
  };

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/dev/components");
  });

  test("뒤로 가기는 시트만 닫고 화면은 그대로 둔다", async ({ page }) => {
    await openSheet(page);
    await expect(sheet(page)).toBeVisible();
    await page.goBack();
    await expect(sheet(page)).toBeHidden();
    await expect(page).toHaveURL("/dev/components");
  });

  test("바깥을 누르면 시트가 닫힌다", async ({ page }) => {
    await openSheet(page);
    await expect(sheet(page)).toBeVisible();
    await page.mouse.click(195, 40);
    await expect(sheet(page)).toBeHidden();
  });

  test("시트를 아래로 끌면 닫힌다", async ({ page }) => {
    await openSheet(page);
    const handle = await sheet(page).getByTestId("sheet-handle").boundingBox();
    if (!handle) throw new Error("손잡이가 보이지 않습니다");
    const x = handle.x + handle.width / 2;
    await page.mouse.move(x, handle.y + 10);
    await page.mouse.down();
    await page.mouse.move(x, handle.y + 400, { steps: 10 });
    await page.mouse.up();
    await expect(sheet(page)).toBeHidden();
  });

  test("다이얼로그는 뒤로 가기·Esc·바깥 탭으로 닫히지 않고, 아래 시트도 그대로다", async ({
    page,
  }) => {
    await openSheet(page);
    await page.getByRole("button", { name: "시트 위에 다이얼로그" }).click();
    await expect(deleteDialog(page)).toBeVisible();

    await page.goBack();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await page.mouse.click(195, 40);
    await expect(deleteDialog(page)).toBeVisible();
    await expect(sheet(page)).toBeVisible();

    await deleteDialog(page).getByRole("button", { name: "취소" }).click();
    await expect(deleteDialog(page)).toBeHidden();
    await expect(sheet(page)).toBeVisible();
  });

  test("드롭다운은 항목을 고르거나 바깥을 누르면 닫힌다", async ({ page }) => {
    await page.getByRole("button", { name: "정렬: 최신순" }).click();
    await page.mouse.click(20, 20);
    await expect(page.getByRole("listbox")).toBeHidden();

    await page.getByRole("button", { name: "정렬: 최신순" }).click();
    await page.getByRole("option", { name: "금액 큰 순" }).click();
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "정렬: 금액 큰 순" }),
    ).toBeVisible();
  });

  test("저장 실패 알림은 [확인]으로만 닫힌다 (F0-3)", async ({ page }) => {
    await page.getByRole("button", { name: "저장 실패 알림" }).click();
    const alert = page.getByRole("alertdialog", { name: "저장하기" });
    await expect(alert).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(alert).toBeVisible();
    await alert.getByRole("button", { name: "확인", exact: true }).click();
    await expect(alert).toBeHidden();
  });
});
