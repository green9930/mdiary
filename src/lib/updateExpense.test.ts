import { describe, expect, it } from "vitest";

import { handleUpdateExpense } from "@/lib/updateExpense";
import type { ExpenseDetail } from "@/types/expenseTypes";

const original: ExpenseDetail["expense"] = {
  id: "e1",
  date: "2026-10-18",
  title: "점심",
  category: "FOOD",
  amount: 8000,
  content: "참치김밥",
};

const request = {
  date: "2026-10-18",
  title: "점심",
  category: "FOOD" as const,
  amount: 8000,
  content: "참치김밥",
  repeat: { type: "none" as const },
};

describe("handleUpdateExpense (데이터 아키텍처 8-1 PATCH: 바꾼 필드 + scope)", () => {
  it("바뀐 필드만 담고 범위는 이 건이다", () => {
    expect(
      handleUpdateExpense(original, {
        ...request,
        title: "저녁",
        amount: 9000,
      }),
    ).toEqual({ title: "저녁", amount: 9000, scope: { type: "one" } });
  });

  it("내용을 비우면 null로 보낸다", () => {
    expect(
      handleUpdateExpense(original, { ...request, content: null }),
    ).toEqual({
      content: null,
      scope: { type: "one" },
    });
  });

  it("앞뒤 공백만 다른 제목·내용은 바뀌지 않은 것으로 본다 (서버가 지운다)", () => {
    expect(
      handleUpdateExpense(original, {
        ...request,
        title: " 점심 ",
        content: "참치김밥 ",
      }),
    ).toBeNull();
  });

  it("바뀐 것이 없으면 null", () => {
    expect(handleUpdateExpense(original, request)).toBeNull();
  });
});
