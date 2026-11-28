import { validationFailed, withApiErrors } from "@/server/apiResponse";
import { getSessionUser, unauthorized } from "@/server/session";
import { getCategoryStats } from "@/server/statsService";
import { fieldErrorCodes, periodQuerySchema } from "@/shared/expenseSchema";

// 기간의 카테고리별 합계 (데이터 아키텍처 8-1)
export const GET = withApiErrors(async (request: Request) => {
  const parsed = periodQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) return validationFailed(fieldErrorCodes(parsed.error));

  const user = await getSessionUser();
  if (!user) return unauthorized();

  return Response.json(await getCategoryStats(user.id, parsed.data));
});
