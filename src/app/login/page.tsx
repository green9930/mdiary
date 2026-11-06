import GoogleSignInButton from "@/features/auth/GoogleSignInButton";
import { safeNextPath } from "@/shared/nextPath";

// 임시: F1에서 SC-02 로그인 화면으로 바꾼다
const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) => {
  const { next } = await searchParams;

  return (
    <main className="mx-auto max-w-97.5 space-y-6 p-4 pt-24">
      <h1 className="font-logo text-title-l text-brand">다씀</h1>
      <GoogleSignInButton next={safeNextPath(next)} />
    </main>
  );
};

export default LoginPage;
