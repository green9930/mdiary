import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { URL_PARAMS } from "@/shared/sharedConstants";

/**
 * 상세 시트를 쿼리 `expense`로 연다 (화면 명세 SC-08, 공통 규약 상태를 URL에 둔다).
 * 열기는 기록을 쌓고(push) 뒤로 가기로 닫힌다. 주소로 바로 열렸으면(새로고침) 쿼리만 지운다
 */
export const useExpenseSheetQuery = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const expenseId = params.get(URL_PARAMS.expense);
  // 이 화면에서 push로 열었는지. 그래야 뒤로 가기로 닫을 기록이 있다
  const pushed = useRef(false);
  // 시트가 닫힌 주소가 되면 실행할 일 (handleAfterClose)
  const afterClose = useRef<(() => void) | null>(null);

  const pathWith = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set(URL_PARAMS.expense, id);
    else next.delete(URL_PARAMS.expense);
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  useEffect(() => {
    if (expenseId !== null) return;
    pushed.current = false;
    const next = afterClose.current;
    afterClose.current = null;
    next?.();
  }, [expenseId]);

  const open = (id: string) => {
    pushed.current = true;
    router.push(pathWith(id), { scroll: false });
  };

  const close = () => {
    if (pushed.current) router.back();
    else router.replace(pathWith(null), { scroll: false });
  };

  return {
    /** 열린 기록 id. 닫혀 있으면 null */
    expenseId,
    open,
    close,
    /** 시트를 닫은 뒤(주소에서 expense가 빠진 뒤) next를 실행한다 ([수정] → 수정 화면) */
    handleAfterClose: (next: () => void) => {
      afterClose.current = next;
      close();
    },
  };
};
