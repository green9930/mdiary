import { z } from "zod";

import {
  notFound,
  scopeNotAllowed,
  validationFailed,
  withApiErrors,
} from "@/server/apiResponse";
import {
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/server/expenseService";
import { getSessionUser, unauthorized } from "@/server/session";
import {
  deleteExpenseSchema,
  fieldErrorCodes,
  updateExpenseSchema,
} from "@/shared/expenseSchema";

interface ExpenseRouteContext {
  params: Promise<{ id: string }>;
}

// 형식이 틀린 id는 없는 기록과 같게 404로 답한다 (DB의 uuid 칸에 넣지 않는다)
const readId = async ({ params }: ExpenseRouteContext) => {
  const { id } = await params;
  return z.uuid().safeParse(id).success ? id : null;
};

const readBody = (request: Request): Promise<unknown> =>
  request.json().catch(() => undefined);

// 기록 1건 + (optional) 반복 정보 (데이터 아키텍처 8-1)
export const GET = withApiErrors(
  async (_request: Request, context: ExpenseRouteContext) => {
    const id = await readId(context);
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
    const id = await readId(context);
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
    const id = await readId(context);
    const parsed = deleteExpenseSchema.safeParse(await readBody(request));
    if (!parsed.success) return validationFailed(fieldErrorCodes(parsed.error));

    const user = await getSessionUser();
    if (!user) return unauthorized();
    if (!id) return notFound();

    const result = await deleteExpense(user.id, id);
    if (!result) return notFound();
    return "error" in result ? scopeNotAllowed() : Response.json(result);
  },
);
