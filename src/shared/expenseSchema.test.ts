import { describe, expect, it } from "vitest";

import {
  createExpenseSchema,
  deleteExpenseSchema,
  fieldErrorCodes,
  periodQuerySchema,
  scopePreviewQuerySchema,
  updateExpenseSchema,
} from "@/shared/expenseSchema";

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
    it("없는 날짜나 2020년 앞·2099년 뒤면 INVALID", () => {
      expect(errorsOf({ date: "2026-02-30" })).toEqual({ date: "INVALID" });
      expect(errorsOf({ date: "2019-12-31" })).toEqual({ date: "INVALID" });
      expect(errorsOf({ date: "2100-01-01" })).toEqual({ date: "INVALID" });
    });

    it("카테고리가 없거나 10개에 없는 값이면 REQUIRED", () => {
      expect(errorsOf({ category: undefined })).toEqual({
        category: "REQUIRED",
      });
      expect(errorsOf({ category: "CAFE" })).toEqual({ category: "REQUIRED" });
    });
  });

  describe("반복 (데이터 아키텍처 8-2)", () => {
    it("없음 · 정기 N개월 · 정기 계속 · 할부를 받는다", () => {
      for (const repeat of [
        { type: "none" },
        { type: "recurring", months: 6 },
        { type: "recurring", continuous: true },
        { type: "installment", count: 3, basis: "perCount" },
        { type: "installment", count: 3, basis: "total" },
      ])
        expect(parse({ repeat }).data?.repeat).toEqual(repeat);
    });

    it("개월 수·회차가 2~99 밖이면 OUT_OF_RANGE", () => {
      for (const repeat of [
        { type: "recurring", months: 1 },
        { type: "recurring", months: 100 },
      ])
        expect(errorsOf({ repeat })).toEqual({ repeat: "OUT_OF_RANGE" });
    });

    it("모양이 틀리면 INVALID", () => {
      for (const repeat of [
        { type: "recurring", continuous: false },
        { type: "recurring" },
        { type: "installment", count: 3 },
        { type: "installment", count: 1.5, basis: "total" },
        { type: "weekly" },
        undefined,
      ])
        expect(errorsOf({ repeat })).toEqual({ repeat: "INVALID" });
    });

    it("기간이 2099년 12월을 넘으면 OUT_OF_RANGE", () => {
      expect(
        parse({ date: "2099-07-31", repeat: { type: "recurring", months: 6 } })
          .success,
      ).toBe(true);
      expect(
        errorsOf({
          date: "2099-08-01",
          repeat: { type: "installment", count: 6, basis: "perCount" },
        }),
      ).toEqual({ repeat: "OUT_OF_RANGE" });
    });

    it("계속 반복은 2099년에 시작해도 받는다 (만들 때 2099년 12월까지만 만든다)", () => {
      expect(
        parse({
          date: "2099-12-01",
          repeat: { type: "recurring", continuous: true },
        }).success,
      ).toBe(true);
    });

    it("할부 총액이 회차 수보다 작으면 BELOW_COUNT", () => {
      const repeat = { type: "installment", count: 3, basis: "total" };
      expect(parse({ amount: 3, repeat }).success).toBe(true);
      expect(errorsOf({ amount: 2, repeat })).toEqual({
        amount: "BELOW_COUNT",
      });
      expect(
        parse({ amount: 2, repeat: { ...repeat, basis: "perCount" } }).success,
      ).toBe(true);
    });
  });

  it("여러 필드가 틀리면 필드마다 코드를 모은다", () => {
    expect(errorsOf({ title: "", amount: 0 })).toEqual({
      title: "REQUIRED",
      amount: "OUT_OF_RANGE",
    });
  });
});

describe("범위 (데이터 아키텍처 8-1 scope)", () => {
  it("이번 건만 · 이후 전체 · 이 건부터 N개월(1~99)을 받는다", () => {
    for (const scope of [
      { type: "one" },
      { type: "after" },
      { type: "count", n: 1 },
      { type: "count", n: 99 },
    ]) {
      expect(deleteExpenseSchema.safeParse({ scope }).data?.scope).toEqual(
        scope,
      );
      expect(
        updateExpenseSchema.safeParse({ title: "점심", scope }).success,
      ).toBe(true);
    }
  });

  it("N이 없거나 1~99 밖이면 거절한다", () => {
    for (const scope of [
      { type: "count" },
      { type: "count", n: 0 },
      { type: "count", n: 100 },
      { type: "all" },
    ])
      expect(deleteExpenseSchema.safeParse({ scope }).success).toBe(false);
  });
});

describe("scopePreviewQuerySchema (`GET /api/expenses/:id/scope`)", () => {
  const parse = (query: Record<string, string>) =>
    scopePreviewQuerySchema.safeParse(query);

  it("범위와 바꾼 날짜를 읽는다", () => {
    expect(parse({ scope: "count", n: "6" }).data).toEqual({
      scope: { type: "count", n: 6 },
    });
    expect(parse({ scope: "after", date: "2027-01-03" }).data).toEqual({
      scope: { type: "after" },
      date: "2027-01-03",
    });
  });

  it("범위가 틀리거나 날짜가 잘못됐으면 거절한다", () => {
    expect(parse({ scope: "count" }).success).toBe(false);
    expect(parse({ scope: "count", n: "abc" }).success).toBe(false);
    expect(parse({ scope: "after", date: "2027-02-30" }).success).toBe(false);
    expect(parse({}).success).toBe(false);
  });
});

describe("periodQuerySchema (`GET /api/stats`·`GET /api/expenses?from=`)", () => {
  const errorsOf = (query: Record<string, string>) => {
    const result = periodQuerySchema.safeParse(query);
    return result.success ? {} : fieldErrorCodes(result.error);
  };

  it("시작·끝 달을 읽는다", () => {
    expect(
      periodQuerySchema.safeParse({ from: "2025-11", to: "2026-10" }).data,
    ).toEqual({ from: "2025-11", to: "2026-10" });
  });

  it("빠졌거나 없는 달이면 그 필드 오류", () => {
    expect(errorsOf({ to: "2026-10" })).toEqual({ from: "REQUIRED" });
    expect(errorsOf({ from: "2026-13", to: "2019-12" })).toEqual({
      from: "INVALID",
      to: "INVALID",
    });
  });

  it("시작 > 끝이거나 60개월을 넘으면 OUT_OF_RANGE", () => {
    expect(errorsOf({ from: "2026-11", to: "2026-10" })).toEqual({
      to: "OUT_OF_RANGE",
    });
    expect(errorsOf({ from: "2021-10", to: "2026-10" })).toEqual({
      to: "OUT_OF_RANGE",
    });
  });
});
