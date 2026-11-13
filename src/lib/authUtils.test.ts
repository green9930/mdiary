import { describe, expect, it } from "vitest";

import { handleLoginNotice } from "@/lib/authUtils";
import { LOGIN_TEXTS } from "@/shared/sharedConstants";

describe("handleLoginNotice (화면 명세 SC-02 오류와 화면 대응)", () => {
  it.each([
    ["expired", LOGIN_TEXTS.expired, "info"],
    ["withdrawn", LOGIN_TEXTS.withdrawn, "info"],
    ["failed", LOGIN_TEXTS.failed, "error"],
  ] as const)("reason=%s면 안내 문구를 고른다", (reason, text, tone) => {
    expect(handleLoginNotice(reason)).toEqual({ text, tone });
  });

  it.each([[undefined], [""], ["unknown"]])(
    "reason이 %s면 문구가 없다",
    (reason) => {
      expect(handleLoginNotice(reason)).toBeNull();
    },
  );
});
