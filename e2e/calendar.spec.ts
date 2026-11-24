import { expect, type Page, test } from "@playwright/test";

import { loginAsTestUser } from "./helpers";

// 테스트끼리 데이터가 겹치지 않게 다른 테스트가 쓰지 않는 먼 미래의 달을 쓴다

const thisMonth = () =>
  new Date()
    .toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })
    .slice(0, 7);

const addExpense = async (
  page: Page,
  { date, title, amount }: { date: string; title: string; amount: string },
) => {
  // 화면이 동작하기 전에 입력하면 값이 사라진다
  await page.goto(`/expenses/new?date=${date}`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: "제목" }).fill(title);
  await page.getByRole("button", { name: "식비" }).click();
  await page.getByRole("textbox", { name: "금액" }).fill(amount);
  await page.getByRole("button", { name: "저장" }).click();
  const alert = page.getByRole("alertdialog", { name: "저장 완료" });
  await alert.getByRole("button", { name: "확인" }).click();
  await expect(alert).toBeHidden();
};

// 월 합계는 화면이 조회한 뒤에 그린다. 보이면 화면이 동작할 준비가 된 것이다
const gotoCalendar = async (page: Page, url: string) => {
  await page.goto(url);
  await expect(page.getByText(/^[\d,]+원$/).first()).toBeVisible();
};

test.describe("월간 달력 (화면 명세 SC-03)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("등록하면 달력에 월 합계·칸 금액·하루 목록이 반영된다", async ({
    page,
  }) => {
    // 등록을 두 번 거친다
    test.slow();
    await addExpense(page, {
      date: "2031-03-14",
      title: "달력 점심",
      amount: "12300",
    });
    await addExpense(page, {
      date: "2031-03-14",
      title: "달력 저녁",
      amount: "1080000",
    });

    await gotoCalendar(page, "/?month=2031-03&date=2031-03-14");
    await expect(
      page.getByRole("button", { name: "2031년 3월 연·월 선택" }),
    ).toBeVisible();
    await expect(page.getByText("1,092,300원", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "2031년 3월 14일 (금) 1,092,300원" }),
    ).toContainText("109.2만");
    await expect(page.getByText("2031년 3월 14일 (금)")).toBeVisible();
    await expect(page.getByText("2건 · 1,092,300원")).toBeVisible();
    const items = page.getByRole("listitem");
    await expect(items.nth(0)).toContainText("달력 점심");
    await expect(items.nth(1)).toContainText("달력 저녁");
  });

  test("‹ ›와 [오늘]로 달을 옮긴다", async ({ page }) => {
    await gotoCalendar(page, "/?month=2031-05&date=2031-05-10");
    await page.getByRole("button", { name: "다음 달" }).click();
    await expect(page).toHaveURL("/?month=2031-06&date=2031-06-01");
    await page.getByRole("button", { name: "이전 달" }).click();
    await expect(page).toHaveURL("/?month=2031-05&date=2031-05-01");

    await page.getByRole("button", { name: "오늘" }).click();
    await expect(page).toHaveURL(new RegExp(`month=${thisMonth()}`));
    await expect(page.getByRole("button", { name: "오늘" })).toBeHidden();
  });

  test("연·월 선택 시트에서 월을 누르면 그 달로 옮기고 시트를 닫는다", async ({
    page,
  }) => {
    await gotoCalendar(page, "/?month=2031-05&date=2031-05-10");
    await page.getByRole("button", { name: "2031년 5월 연·월 선택" }).click();
    const sheet = page.getByRole("dialog", { name: "연·월 선택" });
    // 기록이 없는 과거 해로도 옮길 수 있다
    await sheet.getByRole("button", { name: "이전 해" }).click();
    await sheet.getByRole("button", { name: "7월" }).click();

    await expect(page).toHaveURL("/?month=2030-07&date=2030-07-01");
    await expect(sheet).toBeHidden();
    await expect(
      page.getByRole("button", { name: "2030년 7월 연·월 선택" }),
    ).toBeVisible();
  });

  test("달력을 왼쪽으로 밀면 다음 달로 간다", async ({ page }) => {
    await gotoCalendar(page, "/?month=2031-05&date=2031-05-10");
    const grid = page.getByRole("table");
    const box = await grid.boundingBox();
    if (!box) throw new Error("달력이 보이지 않습니다");
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, y, { steps: 5 });
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 5 });
    await page.mouse.up();

    await expect(page).toHaveURL("/?month=2031-06&date=2031-06-01");
  });

  test("기록이 없는 날은 [기록 추가하기]로 그 날짜의 등록 화면을 연다", async ({
    page,
  }) => {
    await gotoCalendar(page, "/?month=2031-08&date=2031-08-05");
    await expect(page.getByText("기록이 없습니다.")).toBeVisible();
    await page.getByRole("button", { name: "기록 추가하기" }).click();
    await expect(page).toHaveURL("/expenses/new?date=2031-08-05");
  });

  test("＋ 버튼은 달력에서 고른 날짜로 등록 화면을 연다", async ({ page }) => {
    await gotoCalendar(page, "/?month=2031-08&date=2031-08-05");
    await page.getByRole("link", { name: "기록하기" }).click();
    await expect(page).toHaveURL("/expenses/new?date=2031-08-05");
  });

  test("잘못된 쿼리는 이번 달로 바꾼다", async ({ page }) => {
    await page.goto("/?month=2031-13&date=abc");
    await expect(page).toHaveURL(new RegExp(`month=${thisMonth()}`));
  });
});
