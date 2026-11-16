import { withApiErrors } from "@/server/apiResponse";
import { getSessionUser, unauthorized } from "@/server/session";
import { getTitles } from "@/server/titleService";

// 자주 쓴 제목 (데이터 아키텍처 8-1, 6장 제목 추천 목록)
export const GET = withApiErrors(async () => {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  return Response.json({ titles: await getTitles(user.id) });
});
