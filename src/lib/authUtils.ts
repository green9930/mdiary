import { LOGIN_TEXTS } from "@/shared/sharedConstants";
import type { LoginNotice } from "@/types/authTypes";

/** 로그인 화면에 들어온 이유(`reason`)에 맞는 안내 문구. 없거나 모르는 값이면 null (화면 명세 SC-02) */
export const handleLoginNotice = (
  reason: string | undefined,
): LoginNotice | null => {
  switch (reason) {
    case "expired":
      return { text: LOGIN_TEXTS.expired, tone: "info" };
    case "withdrawn":
      return { text: LOGIN_TEXTS.withdrawn, tone: "info" };
    case "failed":
      return { text: LOGIN_TEXTS.failed, tone: "error" };
    default:
      return null;
  }
};
