import { describe, expect, it } from "vitest";

import { cn } from "@/lib/cn";

describe("cn (클래스 이어 붙이기)", () => {
  it("넘긴 순서대로 이어 붙인다", () => {
    expect(cn("bg-primary px-4", "text-on-primary")).toBe(
      "bg-primary px-4 text-on-primary",
    );
  });

  it("거짓 값은 건너뛴다", () => {
    expect(cn("px-4", false, undefined, null, "", "py-2")).toBe("px-4 py-2");
  });

  it("겹치는 클래스를 지우지 않는다", () => {
    expect(cn("px-4", "px-1")).toBe("px-4 px-1");
  });
});
