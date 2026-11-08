// 입력 글자 다루기 (화면 명세 공통 규약 · 입력, 와이어프레임 CG ②③⑤)

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

const graphemes = (value: string) =>
  Array.from(segmenter.segment(value), ({ segment }) => segment);

/** 화면에 보이는 글자 수. 이모지·조합 문자는 1자, 줄바꿈 1개도 1자 */
export const countChars = (value: string) => graphemes(value).length;

/** 앞에서부터 max자까지만 남긴다. 이모지를 중간에서 자르지 않는다 */
export const clampChars = (value: string, max: number) => {
  const chars = graphemes(value);
  return chars.length <= max ? value : chars.slice(0, max).join("");
};

/** 숫자만 골라 맨 앞 0을 지우고, maxDigits가 있으면 그 자릿수에서 자른다 */
export const toDigits = (value: string, maxDigits?: number) => {
  const digits = value.replace(/\D/g, "").replace(/^0+/, "");
  return maxDigits === undefined ? digits : digits.slice(0, maxDigits);
};

// 줄바꿈(\n)을 뺀 제어문자, 폭 없는 공백·방향 표시·BOM. 이모지를 잇는 ZWJ(U+200D)는 남긴다
const INVISIBLE = new RegExp(
  String.raw`[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]`,
  "g",
);

/** 저장할 때 보이지 않는 제어문자를 지운다 */
export const removeControlChars = (value: string) =>
  value.replace(INVISIBLE, "");

/** 한 줄 입력(제목): 줄바꿈·탭을 공백으로 바꾼다 */
export const toSingleLine = (value: string) =>
  value.replace(/\r\n|[\r\n\t]/g, " ");
