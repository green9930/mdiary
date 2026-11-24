import { isValidMonth } from "@/lib/date";
import { validationFailed, withApiErrors } from "@/server/apiResponse";
import { getMonthTotals } from "@/server/calendarService";
import { getSessionUser, unauthorized } from "@/server/session";

// 한 달의 날짜별 합계·월 합계 (데이터 아키텍처 8-1)
export const GET = withApiErrors(async (request: Request) => {
  const month = new URL(request.url).searchParams.get("month");
  if (month === null || !isValidMonth(month))
    return validationFailed({ month: "INVALID" });

  const user = await getSessionUser();
  if (!user) return unauthorized();

  return Response.json(await getMonthTotals(user.id, month));
});
