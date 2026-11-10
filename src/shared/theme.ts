import { THEMES } from "@/shared/themeConstants";
import type { ThemeType } from "@/types/themeTypes";

/** 쿠키 값을 화면 모드로. 없거나 잘못됐으면 시스템 설정 따름 */
export const parseTheme = (value: string | undefined): ThemeType =>
  THEMES.find((theme) => theme === value) ?? "system";
