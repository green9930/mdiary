import { expect, type Page, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

// 테스트끼리 데이터가 겹치지 않게 다른 테스트가 쓰지 않는 먼 미래의 날을 쓴다

const createExpense = async (page: Page, date: string, title: string) => {
  const response = await page.request.post("/api/expenses", {
    data: {
      date,
      title,
      category: "FOOD",
      amount: 8000,
      content: "회사 앞\n김밥집",
      repeat: { type: "none" },
    },
  });
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { id: string }).id;
};

// 하루 목록이 보이면 화면이 동작할 준비가 된 것이다
const gotoDay = async (page: Page, date: string) => {
  await page.goto(`/?month=${date.slice(0, 7)}&date=${date}`);
  await expect(page.getByText(/^\d+건/)).toBeVisible();
};

const sheet = (page: Page) => page.getByRole("dialog", { name: "기록 상세" });

test.describe("상세·수정·삭제 (화면 명세 SC-08, SC-06 수정)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("목록 항목을 누르면 상세 시트가 열리고, 새로고침해도 열려 있고, 뒤로 가기로 닫힌다", async ({
    page,
  }) => {
    const id = await createExpense(page, "2032-01-10", "상세 점심");
    await gotoDay(page, "2032-01-10");

    await page.getByRole("button", { name: /상세 점심/ }).click();
    await expect(sheet(page)).toBeVisible();
    await expect(page).toHaveURL(
      `/?month=2032-01&date=2032-01-10&expense=${id}`,
    );
    await expect(sheet(page).getByText("8,000원")).toBeVisible();
    await expect(sheet(page).getByText(/회사 앞/)).toBeVisible();

    await page.reload();
    await expect(sheet(page)).toBeVisible();
    await expect(sheet(page).getByText("상세 점심")).toBeVisible();

    // 새로고침으로 열린 시트는 바깥을 누르면 쿼리만 지운다
    await page.mouse.click(10, 10);
    await expect(sheet(page)).toBeHidden();
    await expect(page).toHaveURL("/?month=2032-01&date=2032-01-10");

    await page.getByRole("button", { name: /상세 점심/ }).click();
    await expect(sheet(page)).toBeVisible();
    await page.goBack();
    await expect(sheet(page)).toBeHidden();
    await expect(page).toHaveURL("/?month=2032-01&date=2032-01-10");
  });

  test("[수정]으로 바꿔 저장하면 시트가 닫힌 달력으로 돌아오고 반영된다", async ({
    page,
  }) => {
    await createExpense(page, "2032-02-10", "수정 전");
    await gotoDay(page, "2032-02-10");
    await page.getByRole("button", { name: /수정 전/ }).click();

    await sheet(page).getByRole("button", { name: "수정" }).click();
    await expect(page).toHaveURL(/\/expenses\/[^/]+\/edit$/);
    await expect(page.getByRole("heading", { name: "수정하기" })).toBeVisible();
    const title = page.getByRole("textbox", { name: "제목" });
    await expect(title).toHaveValue("수정 전");
    await title.fill("수정 후");
    await page.getByRole("button", { name: "저장" }).click();

    await expect(page).toHaveURL("/?month=2032-02&date=2032-02-10");
    await expect(sheet(page)).toBeHidden();
    await expect(page.getByRole("button", { name: /수정 후/ })).toBeVisible();
  });

  test("[삭제]하면 확인 뒤 지우고 시트를 닫으며 목록에서 사라진다", async ({
    page,
  }) => {
    await createExpense(page, "2032-03-10", "지울 기록");
    await gotoDay(page, "2032-03-10");
    await page.getByRole("button", { name: /지울 기록/ }).click();

    await sheet(page).getByRole("button", { name: "삭제" }).click();
    const confirm = page.getByRole("alertdialog", { name: "삭제하기" });
    await expect(confirm).toContainText("이 기록을 삭제하시겠습니까?");
    await confirm.getByRole("button", { name: "삭제" }).click();

    await expect(sheet(page)).toBeHidden();
    await expect(page).toHaveURL("/?month=2032-03&date=2032-03-10");
    await expect(page.getByText("0건")).toBeVisible();
  });

  test("없는 기록의 주소는 기록 없음 알림 뒤 쿼리를 지운다", async ({
    page,
  }) => {
    const missing = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
    await page.goto(`/?month=2032-04&date=2032-04-10&expense=${missing}`);

    const alert = page.getByRole("alertdialog", { name: "기록 없음" });
    await expect(alert).toContainText("이미 삭제된 기록입니다.");
    await alert.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL("/?month=2032-04&date=2032-04-10");
    await expect(sheet(page)).toBeHidden();
  });

  test("없는 기록의 수정 화면은 기록 없음 알림 뒤 달력으로 간다", async ({
    page,
  }) => {
    await page.goto("/expenses/0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b/edit");

    const alert = page.getByRole("alertdialog", { name: "기록 없음" });
    await alert.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL("/");
  });
});
