import { PATHS } from "@/shared/sharedConstants";

// 로그인 뒤 돌아갈 경로 (화면 명세 RT).
// 외부 주소로 넘어가지 않도록 이 서비스 안의 경로(`/`로 시작, `//`·`/\` 아님)만 받는다.
export const safeNextPath = (value: string | null | undefined): string => {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return PATHS.calendar;
  }
  return value;
};

export type TLoginReason = "expired" | "withdrawn";

export const loginPath = (next: string, reason?: TLoginReason): string => {
  const params = new URLSearchParams({ next });
  if (reason) params.set("reason", reason);
  return `${PATHS.login}?${params}`;
};
