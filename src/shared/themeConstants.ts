// 화면 모드 (SC-10). 이 기기에만 저장하므로 쿠키에 둔다.
// 서버가 첫 화면부터 html의 data-theme를 그려 깜빡이지 않는다.
export const THEME_COOKIE = "theme";

export const THEMES = ["system", "light", "dark"] as const;

export type TTheme = (typeof THEMES)[number];
