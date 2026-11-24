import type {
  CreateExpenseRequestType,
  ExpenseDetail,
  UpdateExpenseRequestType,
} from "@/types/expenseTypes";

// 앞뒤 공백 제거, 빈 내용은 null (서버 저장 형태)
const normalizeText = (value: string | null | undefined) =>
  value?.trim() || null;

/**
 * 수정 폼의 값에서 원래 기록과 다른 필드만 골라 수정 요청을 만든다 (데이터 아키텍처 8-1 PATCH).
 * 범위는 이 건만이다. 바뀐 것이 없으면 null
 */
export const handleUpdateExpense = (
  original: ExpenseDetail["expense"],
  request: CreateExpenseRequestType,
): UpdateExpenseRequestType | null => {
  const changes: Omit<UpdateExpenseRequestType, "scope"> = {};
  if (request.date !== original.date) changes.date = request.date;
  if (normalizeText(request.title) !== original.title)
    changes.title = request.title;
  if (request.category !== original.category)
    changes.category = request.category;
  if (request.amount !== original.amount) changes.amount = request.amount;
  const content = normalizeText(request.content);
  if (content !== original.content) changes.content = content;

  return Object.keys(changes).length > 0
    ? { ...changes, scope: { type: "one" } }
    : null;
};
