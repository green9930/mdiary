import { describe, expect, it } from "vitest";

import { createExpenseSchema, fieldErrorCodes } from "@/shared/expenseSchema";

const valid = {
  date: "2026-10-18",
  title: "점심",
  category: "FOOD",
  amount: 8000,
  content: null,
  repeat: { type: "none" },
};

const parse = (overrides: Record<string, unknown>) =>
  createExpenseSchema.safeParse({ ...valid, ...overrides });

const errorsOf = (overrides: Record<string, unknown>) => {
  const result = parse(overrides);
  return result.success ? {} : fieldErrorCodes(result.error);
};

describe("createExpenseSchema (데이터 아키텍처 3-2, 8-2)", () => {
  it("올바른 요청을 받는다", () => {
    expect(parse({}).success).toBe(true);
  });

  describe("제목", () => {
    it("앞뒤 공백을 지운다", () => {
      expect(parse({ title: "  점심  " }).data?.title).toBe("점심");
    });

    it("줄바꿈·탭은 공백으로, 보이지 않는 제어문자는 지운다", () => {
      expect(parse({ title: "점심\n김밥​" }).data?.title).toBe("점심 김밥");
    });

    it("비었거나 공백뿐이면 REQUIRED", () => {
      expect(errorsOf({ title: "" })).toEqual({ title: "REQUIRED" });
      expect(errorsOf({ title: "   " })).toEqual({ title: "REQUIRED" });
    });

    it("화면에 보이는 글자로 25자까지 받는다", () => {
      expect(parse({ title: "가".repeat(25) }).success).toBe(true);
      expect(parse({ title: "👍🏻".repeat(25) }).success).toBe(true);
      expect(errorsOf({ title: "가".repeat(26) })).toEqual({
        title: "TOO_LONG",
      });
    });
  });

  describe("내용", () => {
    it("비었거나 공백뿐이면 null로 저장한다", () => {
      expect(parse({ content: "" }).data?.content).toBeNull();
      expect(parse({ content: "  \n " }).data?.content).toBeNull();
    });

    it("앞뒤 공백을 지우고 줄바꿈은 남긴다", () => {
      expect(parse({ content: " 참치김밥\n2줄 " }).data?.content).toBe(
        "참치김밥\n2줄",
      );
    });

    it("200자까지 받는다 (줄바꿈 1개 = 1자)", () => {
      expect(parse({ content: "가".repeat(199) + "\n" }).success).toBe(true);
      expect(errorsOf({ content: "가".repeat(201) })).toEqual({
        content: "TOO_LONG",
      });
    });
  });

  describe("금액", () => {
    it("1 ~ 999,999,999 정수를 받는다", () => {
      expect(parse({ amount: 1 }).success).toBe(true);
      expect(parse({ amount: 999_999_999 }).success).toBe(true);
    });

    it("범위 밖이거나 정수가 아니면 OUT_OF_RANGE", () => {
      expect(errorsOf({ amount: 0 })).toEqual({ amount: "OUT_OF_RANGE" });
      expect(errorsOf({ amount: 1_000_000_000 })).toEqual({
        amount: "OUT_OF_RANGE",
      });
      expect(errorsOf({ amount: 1.5 })).toEqual({ amount: "OUT_OF_RANGE" });
    });
  });

  describe("날짜·카테고리·반복", () => {
    it("없는 날짜나 2099년 뒤면 INVALID", () => {
      expect(errorsOf({ date: "2026-02-30" })).toEqual({ date: "INVALID" });
      expect(errorsOf({ date: "2100-01-01" })).toEqual({ date: "INVALID" });
    });

    it("카테고리가 없거나 10개에 없는 값이면 REQUIRED", () => {
      expect(errorsOf({ category: undefined })).toEqual({
        category: "REQUIRED",
      });
      expect(errorsOf({ category: "CAFE" })).toEqual({ category: "REQUIRED" });
    });

    it("반복 없음만 받는다", () => {
      expect(errorsOf({ repeat: { type: "recurring", months: 6 } })).toEqual({
        repeat: "INVALID",
      });
    });
  });

  it("여러 필드가 틀리면 필드마다 코드를 모은다", () => {
    expect(errorsOf({ title: "", amount: 0 })).toEqual({
      title: "REQUIRED",
      amount: "OUT_OF_RANGE",
    });
  });
});
