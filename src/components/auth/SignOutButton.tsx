"use client";

import { useState } from "react";

import Button from "@/components/elements/Button";
import AlertDialog from "@/components/overlays/AlertDialog";
import { authClient } from "@/lib/authClient";
import { hardNavigate } from "@/lib/navigation";
import { BTN_TEXTS, DIALOG_TEXTS, PATHS } from "@/shared/sharedConstants";

// [로그아웃] (화면 명세 SC-10). 확인 없이 실행하고, 실패하면 알림 다이얼로그(와이어프레임 SC-10 ⑤)
const SignOutButton = () => {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const signOut = async () => {
    setPending(true);
    const result = await authClient.signOut().catch(() => null);
    if (result && !result.error) {
      // 페이지를 새로 불러와 화면에 남은 데이터를 버린다
      hardNavigate(PATHS.login);
      return;
    }
    setPending(false);
    setFailed(true);
  };

  return (
    <>
      <Button variant="line" size="lg" loading={pending} onClick={signOut}>
        {BTN_TEXTS.signOut}
      </Button>
      <AlertDialog
        open={failed}
        title={DIALOG_TEXTS.signOutTitle}
        onClose={() => setFailed(false)}
      >
        {DIALOG_TEXTS.signOutFailed}
      </AlertDialog>
    </>
  );
};

export default SignOutButton;
