import { describe, expect, it } from "vitest";

import {
  clampChars,
  countChars,
  removeControlChars,
  toDigits,
  toSingleLine,
} from "@/lib/text";

describe("countChars (CG ③ 글자 수 카운터)", () => {
  it("화면에 보이는 글자 1개를 1자로 센다", () => {
    expect(countChars("쿠팡")).toBe(2);
    expect(countChars("abc")).toBe(3);
  });

  it("이모지는 여러 코드로 이뤄져도 1자다", () => {
    expect(countChars("👍")).toBe(1);
    expect(countChars("👨‍👩‍👧")).toBe(1);
    expect(countChars("👍🏽")).toBe(1);
    expect(countChars("🇰🇷")).toBe(1);
  });

  it("조합 문자(한글 자모 조합, 결합 부호)도 1자다", () => {
    expect(countChars("가")).toBe(1); // ᄀ + ᅡ = 가
    expect(countChars("é")).toBe(1); // é
  });

  it("줄바꿈 1개는 1자다", () => {
    expect(countChars("가\n나")).toBe(3);
    expect(countChars("가\r\n나")).toBe(3);
  });

  it("빈 문자열은 0자다", () => {
    expect(countChars("")).toBe(0);
  });
});

describe("clampChars (한도에서 자르기, 붙여넣기)", () => {
  it("한도 안이면 그대로 둔다", () => {
    expect(clampChars("쿠팡", 25)).toBe("쿠팡");
  });

  it("한도까지만 남긴다", () => {
    expect(clampChars("가나다라", 2)).toBe("가나");
  });

  it("이모지를 중간에서 자르지 않는다", () => {
    expect(clampChars("가👨‍👩‍👧나", 2)).toBe("가👨‍👩‍👧");
  });
});

describe("toDigits (금액·개월 수 숫자만 받기)", () => {
  it("숫자만 골라낸다", () => {
    expect(toDigits("12,000원")).toBe("12000");
    expect(toDigits("12개월abc")).toBe("12");
  });

  it("맨 앞 0을 지운다", () => {
    expect(toDigits("007")).toBe("7");
    expect(toDigits("0")).toBe("");
    expect(toDigits("00")).toBe("");
  });

  it("자릿수 한도에서 자른다", () => {
    expect(toDigits("123", 2)).toBe("12");
    expect(toDigits("0123", 2)).toBe("12");
  });

  it("숫자가 없으면 빈 문자열이다", () => {
    expect(toDigits("abc")).toBe("");
  });
});

describe("removeControlChars (저장할 때 보이지 않는 제어문자 제거)", () => {
  it("제어문자와 보이지 않는 방향·폭 문자를 지운다", () => {
    expect(removeControlChars("가\u0000나\u0007다")).toBe("가나다");
    expect(removeControlChars("​쿠‮팡﻿")).toBe("쿠팡");
  });

  it("줄바꿈은 남긴다", () => {
    expect(removeControlChars("가\n나")).toBe("가\n나");
  });

  it("이모지를 잇는 문자(ZWJ)와 변형 선택자는 남긴다", () => {
    expect(removeControlChars("👨‍👩‍👧")).toBe("👨‍👩‍👧");
    expect(removeControlChars("❤️")).toBe("❤️");
  });
});

describe("toSingleLine (제목: 줄바꿈·탭을 공백으로)", () => {
  it("줄바꿈과 탭을 공백 하나로 바꾼다", () => {
    expect(toSingleLine("점심\n김밥")).toBe("점심 김밥");
    expect(toSingleLine("점심\r\n김밥\t2줄")).toBe("점심 김밥 2줄");
  });
});
