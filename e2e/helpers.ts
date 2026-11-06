import { expect, type Page } from "@playwright/test";

/** 테스트 로그인(P3): 테스트 사용자(test@mdiary.local)로 세션을 만든다 */
export const loginAsTestUser = async (page: Page) => {
  const response = await page.request.post("/api/auth/test-login", {
    data: {},
  });
  expect(response.ok()).toBe(true);
};
