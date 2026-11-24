import { getAccountStats } from "@/server/accountService";
import { withApiErrors } from "@/server/apiResponse";
import { getSessionUser, unauthorized } from "@/server/session";

// 계정 요약: 이메일·전체 건수 (데이터 아키텍처 8-1)
export const GET = withApiErrors(async () => {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const stats = await getAccountStats(user.id);
  return Response.json({ email: user.email, ...stats });
});
