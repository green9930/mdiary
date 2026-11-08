"use client";

import { useState } from "react";

import { authClient } from "@/lib/authClient";

// 임시: F1에서 SC-02 로그인 화면으로 바꾼다
interface GoogleSignInButtonProps {
  next: string;
}

const GoogleSignInButton = ({ next }: GoogleSignInButtonProps) => {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const { error } = await authClient.signIn.social({
          provider: "google",
          callbackURL: next,
        });
        if (error) setPending(false);
      }}
      className="h-12 w-full rounded-md bg-primary text-button-l text-on-primary disabled:bg-disabled disabled:text-on-disabled"
    >
      Google로 계속하기
    </button>
  );
};

export default GoogleSignInButton;
