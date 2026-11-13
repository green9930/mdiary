/** 로그인 화면의 안내 문구 (화면 명세 SC-02). 실패는 오류 색으로 보인다 */
export interface LoginNotice {
  text: string;
  tone: "info" | "error";
}
