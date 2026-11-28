import { timingSafeEqual } from "node:crypto";

import { env } from "@/env";
import { addMonths, convertToKSTStr, monthOf } from "@/lib/date";
import { withApiErrors } from "@/server/apiResponse";
import { extendContinuousSeries } from "@/server/seriesService";
import { unauthorized } from "@/server/session";
import { SERIES_RULES } from "@/shared/expenseConstants";

// Vercel Cron이 붙여 보내는 `Authorization: Bearer <CRON_SECRET>`인지. 비밀값은 시간 차이가 드러나지 않게 비교한다
const isCronRequest = (request: Request) => {
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

// 정기 작업: 계속 반복을 이번 달 + 24개월까지 연장한다 (데이터 아키텍처 5-4·8-1). Vercel Cron은 GET으로 부른다
export const GET = withApiErrors(async (request: Request) => {
  if (!isCronRequest(request)) return unauthorized();
  const untilMonth = addMonths(
    monthOf(convertToKSTStr()),
    SERIES_RULES.extendMonths,
  );
  return Response.json(await extendContinuousSeries({ untilMonth }));
});
