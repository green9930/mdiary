import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn (클래스 합치기)", () => {
  it("뒤에 넘긴 클래스가 같은 속성의 앞 클래스를 이긴다", () => {
    expect(cn("bg-primary px-4", "bg-danger")).toBe("px-4 bg-danger");
  });

  it("글자 크기 토큰과 글자 색 토큰은 서로 지우지 않는다", () => {
    expect(cn("text-body text-text", "text-text-sub")).toBe(
      "text-body text-text-sub",
    );
    expect(cn("text-body", "text-caption")).toBe("text-caption");
  });

  it("그림자·모서리 토큰을 알아본다", () => {
    expect(cn("shadow-1", "shadow-2")).toBe("shadow-2");
    expect(cn("rounded-md", "rounded-sheet")).toBe("rounded-sheet");
  });

  it("거짓 값은 건너뛴다", () => {
    expect(cn("px-4", false, undefined, null, "py-2")).toBe("px-4 py-2");
  });
});
