"use client";

import { useEffect, useState } from "react";

import Button from "@/components/elements/Button";
import { authClient } from "@/lib/authClient";
import { loginPath } from "@/shared/nextPath";
import { BTN_TEXTS, LOGIN_TEXTS } from "@/shared/sharedConstants";
import type { LoginNotice } from "@/types/authTypes";
import GoogleLogo from "@/assets/logo_google.svg";

interface LoginFormProps {
  /** 로그인 뒤 돌아갈 경로 (safeNextPath를 거친 값) */
  next: string;
  /** 들어온 이유(`reason`)의 안내 문구 */
  notice: LoginNotice | null;
}

const FAILED_NOTICE: LoginNotice = { text: LOGIN_TEXTS.failed, tone: "error" };

// [Google로 계속하기]와 그 아래 안내 문구 (화면 명세 SC-02, 와이어프레임 ③~⑤)
const LoginForm = ({ next, notice: initialNotice }: LoginFormProps) => {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(initialNotice);

  // Google 화면에서 뒤로 가기로 돌아오면 브라우저가 진행 중이던 화면을 그대로 되살린다.
  // 버튼을 다시 누를 수 있게 한다 (문구 없음)
  useEffect(() => {
    const reset = () => setPending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const signIn = async () => {
    setPending(true);
    setNotice(null);
    // 성공하면 Google 화면으로 넘어간다. Google에서 실패하면 reason=failed로 돌아온다
    const result = await authClient.signIn
      .social({
        provider: "google",
        callbackURL: next,
        errorCallbackURL: loginPath(next, "failed"),
      })
      .catch(() => null);
    if (!result || result.error) {
      setPending(false);
      setNotice(FAILED_NOTICE);
    }
  };

  return (
    <div>
      <Button variant="line" size="lg" loading={pending} onClick={signIn}>
        <GoogleLogo aria-hidden className="size-4.5" />
        {BTN_TEXTS.googleSignIn}
      </Button>
      {/* 높이를 미리 잡아 문구가 나와도 버튼이 움직이지 않는다 */}
      <p
        role="status"
        className={`h-8 pt-2 text-center text-caption ${
          notice?.tone === "error" ? "text-danger-text" : "text-text02"
        }`}
      >
        {notice?.text}
      </p>
    </div>
  );
};

export default LoginForm;
