import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/session";
import { loginPath } from "@/shared/nextPath";

const Home = async () => {
  const user = await getSessionUser();
  if (!user) redirect(loginPath("/", "expired"));

  // 임시: 로그인 확인용. F3에서 달력 화면으로 바꾼다
  return (
    <main className="p-4">
      <p className="text-body text-text-sub">로그인: {user.email}</p>
    </main>
  );
};

export default Home;
