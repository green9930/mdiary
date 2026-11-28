import { z } from "zod";

/** `/api/expenses/[id]/…` 라우트의 두 번째 인자 */
export interface ExpenseRouteContext {
  params: Promise<{ id: string }>;
}

/** 경로의 기록 id. 형식이 틀리면 null이고, 없는 기록과 같게 404로 답한다 (DB의 uuid 칸에 넣지 않는다) */
export const readExpenseId = async ({ params }: ExpenseRouteContext) => {
  const { id } = await params;
  return z.uuid().safeParse(id).success ? id : null;
};
