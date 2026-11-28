import { useState } from "react";

import { useScopePreview } from "@/hooks/useScopePreview";
import {
  convertScopeOptions,
  convertScopePreviewText,
  validateScopeCount,
} from "@/lib/scopeUtils";
import { toDigits } from "@/lib/text";
import { SERIES_RULES } from "@/shared/expenseConstants";
import { DIALOG_TEXTS } from "@/shared/sharedConstants";
import type { ScopePreview, ScopeType } from "@/types/expenseTypes";

interface ScopeSelectionOptions {
  /** 시트가 열려 있는지. 열 때마다 이번 건만·N 빈칸으로 시작한다 */
  open: boolean;
  /** 이 건의 id */
  id: string;
  /** 이 건의 원래 날짜 */
  originalDate: string;
  /** 수정 폼의 날짜 (삭제는 원래 날짜) */
  date: string;
}

/** [저장]·[삭제]로 넘길 범위와 그 미리보기 */
export interface ScopeSelected {
  scope: ScopeType;
  preview: ScopePreview;
}

/** 삭제 확인 본문: 계속 반복의 이후 전체는 반복 종료, 나머지는 `{N}건을 삭제하시겠습니까?` (SC-09 ⑦⑧) */
export const convertDeleteConfirmText = ({ preview }: ScopeSelected) =>
  preview.affected.continuous
    ? DIALOG_TEXTS.deleteContinuousEnd
    : DIALOG_TEXTS.deleteCount(preview.affected.count ?? 1);

/**
 * 반복 기록 범위 선택의 상태 (화면 명세 SC-09).
 * 남은 건수는 이번 건만 미리보기에서 받아 N의 한도로 쓴다
 */
export const useScopeSelection = ({
  open,
  id,
  originalDate,
  date,
}: ScopeSelectionOptions) => {
  const [type, setType] = useState<ScopeType["type"]>("one");
  const [n, setN] = useState("");
  const [nError, setNError] = useState<string>();
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setType("one");
      setN("");
      setNError(undefined);
    }
  }

  const dateChanged = date !== originalDate;
  const previewDate = dateChanged ? date : undefined;
  const options = convertScopeOptions(originalDate, date);

  // 이번 건만 미리보기는 늘 받는다 (남은 건수)
  const base = useScopePreview({
    id,
    scope: open ? { type: "one" } : null,
    date: previewDate,
  });
  const remaining = base.data?.remaining;
  const countValid =
    remaining !== undefined && validateScopeCount(n, remaining) === undefined;

  const scope: ScopeType | null =
    type === "one"
      ? { type }
      : type === "after"
        ? { type }
        : countValid
          ? { type, n: Number(n) }
          : null;
  const current = useScopePreview({
    id,
    scope: open && type !== "one" ? scope : null,
    date: previewDate,
  });
  const query = type === "one" ? base : current;
  // N이 틀리면 미리보기 없이 [저장]·[삭제]를 눌러 오류를 볼 수 있다
  const waitingPreview = scope !== null && !query.data;

  return {
    type,
    n,
    nError,
    options,
    previewText:
      scope && query.data
        ? convertScopePreviewText({
            scope,
            preview: query.data,
            date,
            dateChanged,
          })
        : null,
    previewFailed: scope !== null && query.isError,
    previewRetrying: query.isFetching,
    retryPreview: () => void query.refetch(),
    /** [저장]·[삭제]를 누를 수 있는지 (미리보기를 받았거나 N이 틀림) */
    ready: !waitingPreview,
    select: (next: ScopeType["type"]) => {
      setType(next);
      setNError(undefined);
    },
    setN: (raw: string) => {
      setN(toDigits(raw, SERIES_RULES.repeatDigits));
      setNError(undefined);
    },
    blurN: () => {
      if (type === "count" && remaining !== undefined)
        setNError(validateScopeCount(n, remaining));
    },
    /** 고른 범위와 미리보기. N이 틀리면 오류를 띄우고 null */
    submit: (): ScopeSelected | null => {
      if (type === "count" && remaining !== undefined) {
        const error = validateScopeCount(n, remaining);
        setNError(error);
        if (error) return null;
      }
      return scope && query.data ? { scope, preview: query.data } : null;
    },
  };
};

export type ScopeSelectionType = ReturnType<typeof useScopeSelection>;
