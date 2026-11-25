import { useState } from "react";

import {
  appendFormulaToContent,
  convertCalculatorResult,
  deleteLast,
  formatExpression,
  inputDigit,
  inputOperator,
  startExpression,
} from "@/lib/calculatorUtils";
import { CALCULATOR_RULES } from "@/shared/expenseConstants";
import { CALCULATOR_TEXTS } from "@/shared/sharedConstants";
import type {
  CalculatorDigitType,
  CalculatorKeyType,
  CalculatorOperatorType,
  Rounding,
  RoundingUnitType,
} from "@/types/expenseTypes";

interface UseCalculatorProps {
  open: boolean;
  /** 금액 칸 값 (숫자 문자열). 있으면 첫 숫자로 넣고 시작한다 */
  amount: string;
  /** 내용 칸 값. 계산식을 덧붙일 곳 */
  content: string;
}

/** [적용]으로 폼에 넣을 값. content가 없으면 내용은 그대로 둔다 */
interface CalculatorApplied {
  amount: number;
  content?: string;
}

const DEFAULT_ROUNDING: Rounding = {
  unit: CALCULATOR_RULES.roundingUnits[0],
  direction: "down",
};

/**
 * 계산기 시트의 식·끝전 처리·계산식 기록 (화면 명세 SC-07).
 * 열 때마다 금액 칸 값과 기본값으로 처음부터 시작한다
 */
export const useCalculator = ({
  open,
  amount,
  content,
}: UseCalculatorProps) => {
  const [tokens, setTokens] = useState(() => startExpression(amount));
  const [rounding, setRounding] = useState(DEFAULT_ROUNDING);
  const [record, setRecord] = useState(true);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTokens(startExpression(amount));
      setRounding(DEFAULT_ROUNDING);
      setRecord(true);
    }
  }

  const result = convertCalculatorResult(tokens, rounding);
  const nextContent =
    record && result.formula !== null
      ? appendFormulaToContent(content, result.formula)
      : undefined;

  const press = (key: CalculatorKeyType) => {
    setTokens((prev) => {
      if (key === "backspace") return deleteLast(prev);
      if (key === "clear") return [];
      if (key in CALCULATOR_RULES.operatorSymbols)
        return inputOperator(prev, key as CalculatorOperatorType);
      return inputDigit(prev, key as CalculatorDigitType);
    });
  };

  return {
    /** 식 표시줄 (`36,000 ÷ 3`) */
    expression: formatExpression(tokens),
    result,
    rounding,
    setUnit: (unit: RoundingUnitType) =>
      setRounding((prev) => ({ ...prev, unit })),
    setDirection: (direction: Rounding["direction"]) =>
      setRounding((prev) => ({ ...prev, direction })),
    record,
    setRecord,
    /** 계산식을 덧붙이면 내용이 넘칠 때의 안내 */
    notice: nextContent === null ? CALCULATOR_TEXTS.contentOverflow : null,
    press,
    /** [적용]: 폼에 넣을 금액·내용. 적용할 수 없으면 null */
    apply: (): CalculatorApplied | null => {
      if (result.amount === null) return null;
      return nextContent
        ? { amount: result.amount, content: nextContent }
        : { amount: result.amount };
    },
  };
};
