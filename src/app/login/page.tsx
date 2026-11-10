import GoogleSignInButton from "@/features/auth/GoogleSignInButton";
import { safeNextPath } from "@/shared/nextPath";
import { APP_NAME } from "@/shared/sharedConstants";

// 임시: F1에서 SC-02 로그인 화면으로 바꾼다
interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { next } = await searchParams;

  return (
    <main className="mx-auto max-w-97.5 space-y-6 p-4 pt-24">
      <h1 className="font-logo text-title-lg text-brand">{APP_NAME}</h1>
      <GoogleSignInButton next={safeNextPath(next)} />
    </main>
  );
};

export default LoginPage;
