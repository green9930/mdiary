import LoginForm from "@/components/auth/LoginForm";
import Logo from "@/components/layout/Logo";
import { handleLoginNotice } from "@/lib/authUtils";
import { safeNextPath } from "@/shared/nextPath";
import { APP_NAME, LOGIN_TEXTS } from "@/shared/sharedConstants";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; reason?: string }>;
}

// 로그인 (화면 명세 SC-02). 세션이 있으면 proxy가 next로 보낸다
const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { next, reason } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-120 min-w-80 flex-col px-4 pb-safe">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1>
          <Logo size="lg" />
        </h1>
        <p className="text-caption text-text02">{APP_NAME.en}</p>
        <p className="mt-6 text-body-lg font-bold text-accent">
          {LOGIN_TEXTS.tagline}
        </p>
      </div>
      <div className="pb-4">
        <LoginForm
          next={safeNextPath(next)}
          notice={handleLoginNotice(reason)}
        />
      </div>
    </main>
  );
};

export default LoginPage;
