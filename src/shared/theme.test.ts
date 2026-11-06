import { describe, expect, it } from "vitest";

import { parseTheme } from "./theme";

describe("parseTheme (SC-10 화면 모드)", () => {
  it.each(["system", "light", "dark"] as const)("%s는 그대로 쓴다", (value) => {
    expect(parseTheme(value)).toBe(value);
  });

  it.each([[undefined], [""], ["blue"], ["DARK"]])(
    "값이 없거나 잘못됐으면(%s) 시스템 설정 따름",
    (value) => {
      expect(parseTheme(value)).toBe("system");
    },
  );
});
