import { describe, expect, it } from "vitest";

import { disassemble, getChoseong, matchesTitle } from "@/lib/hangul";

describe("disassemble (자모 분해)", () => {
  it("완성형 글자를 초성·중성·종성으로 나눈다", () => {
    expect(disassemble("쿠팡")).toBe("ㅋㅜㅍㅏㅇ");
  });

  it("겹모음과 겹받침도 나눈다", () => {
    expect(disassemble("과")).toBe("ㄱㅗㅏ");
    expect(disassemble("값")).toBe("ㄱㅏㅂㅅ");
    expect(disassemble("의")).toBe("ㅇㅡㅣ");
  });

  it("호환 자모의 겹모음·겹자음도 나눈다", () => {
    expect(disassemble("ㅘㄳ")).toBe("ㅗㅏㄱㅅ");
  });

  it("한글이 아닌 글자는 그대로 둔다", () => {
    expect(disassemble("A1 점심!")).toBe("A1 ㅈㅓㅁㅅㅣㅁ!");
  });
});

describe("getChoseong (초성 추출)", () => {
  it("완성형 글자의 초성만 남긴다", () => {
    expect(getChoseong("쿠팡이츠")).toBe("ㅋㅍㅇㅊ");
  });

  it("한글이 아닌 글자는 그대로 둔다", () => {
    expect(getChoseong("GS25 편의점")).toBe("GS25 ㅍㅇㅈ");
  });
});

describe("matchesTitle (자주 쓴 제목 추천, 화면 명세 SC-06)", () => {
  it("앞부분이 같으면 일치한다", () => {
    expect(matchesTitle("쿠팡이츠", "쿠팡")).toBe(true);
  });

  it("앞부분이 아니면 일치하지 않는다", () => {
    expect(matchesTitle("쿠팡이츠", "이츠")).toBe(false);
  });

  it("치는 도중의 글자도 이어서 일치한다", () => {
    expect(matchesTitle("쿠팡", "쿺")).toBe(true);
    expect(matchesTitle("과자", "고")).toBe(true);
    expect(matchesTitle("닭갈비", "달")).toBe(true);
  });

  it("초성만 치면 초성으로 비교한다", () => {
    expect(matchesTitle("쿠팡이츠", "ㅋㅍ")).toBe(true);
    expect(matchesTitle("쿠팡이츠", "ㅍㅇ")).toBe(false);
  });

  it("영문은 대소문자를 무시한다", () => {
    expect(matchesTitle("Netflix", "net")).toBe(true);
  });

  it("빈 입력은 일치하지 않는다", () => {
    expect(matchesTitle("쿠팡", "")).toBe(false);
  });
});
