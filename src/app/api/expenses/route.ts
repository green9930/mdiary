import { validationFailed, withApiErrors } from "@/server/apiResponse";
import { createExpense } from "@/server/expenseService";
import { getSessionUser, unauthorized } from "@/server/session";
import { createExpenseSchema, fieldErrorCodes } from "@/shared/expenseSchema";

// 지출 등록 (데이터 아키텍처 8-1·8-2)
export const POST = withApiErrors(async (request: Request) => {
  const body: unknown = await request.json().catch(() => undefined);
  if (body === undefined) return validationFailed({});
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) return validationFailed(fieldErrorCodes(parsed.error));

  const user = await getSessionUser();
  if (!user) return unauthorized();

  return Response.json(await createExpense(user.id, parsed.data), {
    status: 201,
  });
});
