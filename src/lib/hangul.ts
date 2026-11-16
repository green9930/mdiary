// 한글 자모 비교 (화면 명세 SC-06 자주 쓴 제목 추천: 앞부분 + 초성 일치, 치는 도중에도 끊기지 않게)

const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;
const JUNG_COUNT = 21;
const JONG_COUNT = 28;

const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const JUNGSEONG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
// 0번은 받침 없음
const JONGSEONG = [
  "",
  ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ",
];

// 두 번에 나눠 치는 겹모음·겹받침. 나눠 두어야 치는 도중(`고` → `과`)에도 앞부분이 같다
const COMPOUND: Record<string, string> = {
  ㅘ: "ㅗㅏ",
  ㅙ: "ㅗㅐ",
  ㅚ: "ㅗㅣ",
  ㅝ: "ㅜㅓ",
  ㅞ: "ㅜㅔ",
  ㅟ: "ㅜㅣ",
  ㅢ: "ㅡㅣ",
  ㄳ: "ㄱㅅ",
  ㄵ: "ㄴㅈ",
  ㄶ: "ㄴㅎ",
  ㄺ: "ㄹㄱ",
  ㄻ: "ㄹㅁ",
  ㄼ: "ㄹㅂ",
  ㄽ: "ㄹㅅ",
  ㄾ: "ㄹㅌ",
  ㄿ: "ㄹㅍ",
  ㅀ: "ㄹㅎ",
  ㅄ: "ㅂㅅ",
};

const splitCompound = (jamo: string) => COMPOUND[jamo] ?? jamo;

/** 완성형 글자의 [초성, 중성, 종성] 번호. 완성형이 아니면 null */
const syllableIndex = (char: string) => {
  const code = char.charCodeAt(0);
  if (code < SYLLABLE_START || code > SYLLABLE_END) return null;
  const offset = code - SYLLABLE_START;
  return [
    Math.floor(offset / (JUNG_COUNT * JONG_COUNT)),
    Math.floor(offset / JONG_COUNT) % JUNG_COUNT,
    offset % JONG_COUNT,
  ] as const;
};

/** 한글을 자모로 나눈다. 겹모음·겹받침도 나눈다 (`과` → `ㄱㅗㅏ`, `값` → `ㄱㅏㅂㅅ`) */
export const disassemble = (value: string) =>
  Array.from(value, (char) => {
    const index = syllableIndex(char);
    if (!index) return splitCompound(char);
    const [cho, jung, jong] = index;
    return (
      CHOSEONG.charAt(cho) +
      splitCompound(JUNGSEONG.charAt(jung)) +
      splitCompound(JONGSEONG[jong] ?? "")
    );
  }).join("");

/** 완성형 글자를 초성으로 바꾼다. 그 밖의 글자는 그대로 둔다 (`쿠팡` → `ㅋㅍ`) */
export const getChoseong = (value: string) =>
  Array.from(value, (char) => {
    const index = syllableIndex(char);
    return index ? CHOSEONG.charAt(index[0]) : char;
  }).join("");

const isChoseongOnly = (value: string) =>
  Array.from(value).every((char) => char === " " || CHOSEONG.includes(char));

/**
 * 제목이 입력과 일치하는지. 초성만 쳤으면 초성끼리, 아니면 자모로 나눠 앞부분을 비교한다.
 * 영문 대소문자는 무시한다
 */
export const matchesTitle = (title: string, query: string) => {
  if (!query) return false;
  const target = title.toLowerCase();
  const input = query.toLowerCase();
  return isChoseongOnly(input)
    ? getChoseong(target).startsWith(input)
    : disassemble(target).startsWith(disassemble(input));
};
