import {
  notFound,
  scopeNotAllowed,
  validationFailed,
  withApiErrors,
} from "@/server/apiResponse";
import { getExpense } from "@/server/expenseService";
import { type ExpenseRouteContext, readExpenseId } from "@/server/routeParams";
import { deleteExpense, updateExpense } from "@/server/scopeService";
import { getSessionUser, unauthorized } from "@/server/session";
import {
  deleteExpenseSchema,
  fieldErrorCodes,
  updateExpenseSchema,
} from "@/shared/expenseSchema";

const readBody = (request: Request): Promise<unknown> =>
  request.json().catch(() => undefined);

// 기록 1건 + (optional) 반복 정보 (데이터 아키텍처 8-1)
export const GET = withApiErrors(
  async (_request: Request, context: ExpenseRouteContext) => {
    const id = await readExpenseId(context);
    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!id) return notFound();

    const detail = await getExpense(user.id, id);
    return detail ? Response.json(detail) : notFound();
  },
);

// 기록 수정: 바꾼 필드 + scope (데이터 아키텍처 8-1·8-3)
export const PATCH = withApiErrors(
  async (request: Request, context: ExpenseRouteContext) => {
    const id = await readExpenseId(context);
    const parsed = updateExpenseSchema.safeParse(await readBody(request));
    if (!parsed.success) return validationFailed(fieldErrorCodes(parsed.error));

    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!id) return notFound();

    const result = await updateExpense(user.id, id, parsed.data);
    if (!result) return notFound();
    return "error" in result ? scopeNotAllowed() : Response.json(result);
  },
);

// 기록 삭제: scope (데이터 아키텍처 8-1·8-3)
export const DELETE = withApiErrors(
  async (request: Request, context: ExpenseRouteContext) => {
    const id = await readExpenseId(context);
    const parsed = deleteExpenseSchema.safeParse(await readBody(request));
    if (!parsed.success) return validationFailed(fieldErrorCodes(parsed.error));

    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!id) return notFound();

    const result = await deleteExpense(user.id, id, parsed.data.scope);
    if (!result) return notFound();
    return "error" in result ? scopeNotAllowed() : Response.json(result);
  },
);
