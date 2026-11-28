import {
  notFound,
  scopeNotAllowed,
  validationFailed,
  withApiErrors,
} from "@/server/apiResponse";
import { type ExpenseRouteContext, readExpenseId } from "@/server/routeParams";
import { getScopePreview } from "@/server/scopeService";
import { getSessionUser, unauthorized } from "@/server/session";
import {
  fieldErrorCodes,
  scopePreviewQuerySchema,
} from "@/shared/expenseSchema";

// 반복 기록 범위 미리보기 (데이터 아키텍처 8-1, 5-6)
export const GET = withApiErrors(
  async (request: Request, context: ExpenseRouteContext) => {
    const id = await readExpenseId(context);
    const parsed = scopePreviewQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success) return validationFailed(fieldErrorCodes(parsed.error));

    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!id) return notFound();

    const { scope, date } = parsed.data;
    const result = await getScopePreview(user.id, id, scope, date);
    if (!result) return notFound();
    return "error" in result ? scopeNotAllowed() : Response.json(result);
  },
);
