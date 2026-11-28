import { describe, expect, it } from "vitest";

import {
  convertScopeOptions,
  convertScopePreviewText,
  validateScopeCount,
} from "@/lib/scopeUtils";
import type { ScopePreview } from "@/types/expenseTypes";

describe("convertScopeOptions (데이터 아키텍처 5-3 D11)", () => {
  it("날짜의 달이 같으면 모두 고를 수 있다", () => {
    expect(convertScopeOptions("2026-12-25", "2026-12-03")).toEqual({
      after: true,
      count: true,
      hint: null,
    });
  });

  it("뒤 달로 바꾸면 이 건부터 N개월만 막는다", () => {
    expect(convertScopeOptions("2026-12-25", "2027-01-03")).toEqual({
      after: true,
      count: false,
      hint: "날짜의 달을 바꾸면 이 건부터 N개월은 선택할 수 없습니다.",
    });
  });

  it("앞 달로 바꾸면 이번 건만 고를 수 있다", () => {
    expect(convertScopeOptions("2026-12-25", "2026-11-03")).toEqual({
      after: false,
      count: false,
      hint: "앞 달로 옮기면 이번 건만 수정할 수 있습니다.",
    });
  });
});

describe("validateScopeCount (와이어프레임 CG ⑤, SC-09 ⑦)", () => {
  it("빈칸이면 입력 요청, 남은 건수를 넘으면 한도, 아니면 없음", () => {
    expect(validateScopeCount("", 6)).toBe("개월 수를 입력해 주세요.");
    expect(validateScopeCount("7", 6)).toBe("6개월까지 입력할 수 있습니다.");
    expect(validateScopeCount("6", 6)).toBeUndefined();
  });

  it("계속 반복(남은 건수 null)은 99까지", () => {
    expect(validateScopeCount("99", null)).toBeUndefined();
  });
});

const preview = (
  affected: Partial<ScopePreview["affected"]>,
): ScopePreview => ({
  remaining: 6,
  affected: {
    count: 6,
    fromMonth: "2026-10",
    toMonth: "2027-03",
    continuous: false,
    ...affected,
  },
});

describe("convertScopePreviewText (SC-09 범위 미리보기)", () => {
  it("이번 건만: 그 건의 날짜와 1건", () => {
    expect(
      convertScopePreviewText({
        scope: { type: "one" },
        preview: preview({ count: 1 }),
        date: "2026-10-25",
        dateChanged: false,
      }),
    ).toBe("2026년 10월 25일 1건");
  });

  it("기간이 있으면 기간과 건수", () => {
    expect(
      convertScopePreviewText({
        scope: { type: "count", n: 6 },
        preview: preview({}),
        date: "2026-10-25",
        dateChanged: false,
      }),
    ).toBe("2026년 10월 ~ 2027년 3월 (6건)");
  });

  it("계속 반복의 이후 전체: 그 달부터 계속, 날짜를 바꿨으면 새 결제일", () => {
    const continuous = preview({
      count: null,
      fromMonth: "2027-01",
      toMonth: null,
      continuous: true,
    });
    expect(
      convertScopePreviewText({
        scope: { type: "after" },
        preview: continuous,
        date: "2026-12-25",
        dateChanged: false,
      }),
    ).toBe("2027년 1월부터 계속");
    expect(
      convertScopePreviewText({
        scope: { type: "after" },
        preview: continuous,
        date: "2027-01-03",
        dateChanged: true,
      }),
    ).toBe("2027년 1월부터 계속 · 매달 3일");
  });
});
