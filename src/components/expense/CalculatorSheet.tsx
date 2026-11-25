"use client";

import { useEffect, useRef } from "react";

import Button from "@/components/elements/Button";
import Checkbox from "@/components/elements/Checkbox";
import Segment from "@/components/elements/Segment";
import BottomSheet from "@/components/overlays/BottomSheet";
import { useCalculator } from "@/hooks/useCalculator";
import { CALCULATOR_RULES } from "@/shared/expenseConstants";
import {
  ARIA_LABELS,
  BTN_TEXTS,
  CALCULATOR_TEXTS,
  SHEET_TITLES,
} from "@/shared/sharedConstants";
import type {
  CalculatorKeyType,
  Rounding,
  RoundingUnitType,
} from "@/types/expenseTypes";

interface CalculatorSheetProps {
  open: boolean;
  /** 금액 칸 값 (숫자 문자열). 있으면 첫 숫자로 넣고 시작한다 */
  amount: string;
  /** 내용 칸 값. 계산식을 덧붙일 곳 */
  content: string;
  /** [적용]: 금액과, 계산식을 붙였으면 바뀐 내용 */
  onApply: (applied: { amount: number; content?: string }) => void;
  onClose: () => void;
}

const SYMBOLS = CALCULATOR_RULES.operatorSymbols;

// 키패드 4×4 (와이어프레임 SC-07 ⑤)
const KEYPAD: CalculatorKeyType[] = [
  ..."789",
  "/",
  ..."456",
  "*",
  ..."123",
  "-",
  "00",
  "0",
  "backspace",
  "+",
] as CalculatorKeyType[];

const UNIT_OPTIONS = CALCULATOR_RULES.roundingUnits.map((unit) => ({
  value: String(unit),
  label: CALCULATOR_TEXTS.unit(unit),
}));

const DIRECTION_OPTIONS = [
  { value: "up", label: CALCULATOR_TEXTS.roundUp },
  { value: "down", label: CALCULATOR_TEXTS.roundDown },
] as const;

// 물리 키보드 → 계산기 키
const KEYBOARD_KEYS: Record<string, CalculatorKeyType> = {
  ...Object.fromEntries([..."0123456789"].map((digit) => [digit, digit])),
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
  Backspace: "backspace",
};

const isOperatorKey = (key: CalculatorKeyType) => key in SYMBOLS;

// 계산기 바텀시트 (화면 명세 SC-07). 바깥 탭·끌기·뒤로 가기는 적용 없이 닫는다
const CalculatorSheet = ({
  open,
  amount,
  content,
  onApply,
  onClose,
}: CalculatorSheetProps) => {
  const calculator = useCalculator({ open, amount, content });
  const { result } = calculator;

  const apply = () => {
    const applied = calculator.apply();
    if (!applied) return;
    onApply(applied);
    onClose();
  };

  // 키보드 처리는 최신 상태를 보는 함수로 한 번만 건다
  const handleKey = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    handleKey.current = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      // 버튼·입력칸 위의 Enter는 그 요소가 처리한다
      const target = event.target as HTMLElement;
      if (event.key === "Enter") {
        if (target.closest("button, input")) return;
        event.preventDefault();
        apply();
        return;
      }
      const key = KEYBOARD_KEYS[event.key];
      if (!key) return;
      event.preventDefault();
      calculator.press(key);
    };
  });

  useEffect(() => {
    if (!open) return;
    const listener = (event: KeyboardEvent) => handleKey.current(event);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [open]);

  const dimmed = !result.complete || result.error !== null;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={SHEET_TITLES.calculator}
      titleHidden
      footer={
        <div className="flex gap-2">
          <div className="w-20 shrink-0">
            <Button
              variant="line"
              size="lg"
              aria-label={ARIA_LABELS.clear}
              onClick={() => calculator.press("clear")}
            >
              {CALCULATOR_TEXTS.clearKey}
            </Button>
          </div>
          <div className="flex-1">
            <Button size="lg" disabled={result.amount === null} onClick={apply}>
              {BTN_TEXTS.apply}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 식 표시줄 + 결과 미리보기 (⑴⑵) */}
        <div
          aria-live="polite"
          className="flex min-h-24 flex-col items-end justify-end gap-1 text-right"
        >
          <p className="font-num text-body break-all text-text02">
            {calculator.expression}
          </p>
          {result.exact && (
            <p className="font-num text-caption text-text02">{result.exact}</p>
          )}
          {result.value && (
            <p
              className={`font-num text-num-xl ${dimmed ? "text-text03" : "text-text01"}`}
            >
              {CALCULATOR_TEXTS.result(result.value)}
            </p>
          )}
          {result.error && (
            <p className="text-caption text-danger-text">{result.error}</p>
          )}
          {calculator.notice && (
            <p className="text-caption text-text02">{calculator.notice}</p>
          )}
        </div>

        {/* 끝전 처리 (⑶): 나누기가 있을 때만 */}
        {result.hasDivision && (
          <div className="flex flex-col gap-2">
            <p className="text-body text-text01">{CALCULATOR_TEXTS.rounding}</p>
            <div className="flex gap-2">
              <div className="flex-3">
                <Segment
                  aria-label={ARIA_LABELS.roundingUnit}
                  options={UNIT_OPTIONS}
                  value={String(calculator.rounding.unit)}
                  onValueChange={(unit) =>
                    calculator.setUnit(Number(unit) as RoundingUnitType)
                  }
                />
              </div>
              <div className="flex-2">
                <Segment
                  aria-label={ARIA_LABELS.roundingDirection}
                  options={DIRECTION_OPTIONS}
                  value={calculator.rounding.direction}
                  onValueChange={(direction: Rounding["direction"]) =>
                    calculator.setDirection(direction)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* 계산식 기록 (⑷) */}
        <Checkbox
          checked={calculator.record}
          onCheckedChange={calculator.setRecord}
        >
          {CALCULATOR_TEXTS.recordFormula}
        </Checkbox>

        {/* 키패드 (⑸) */}
        <div className="grid grid-cols-4 gap-2">
          {KEYPAD.map((key) => (
            <button
              key={key}
              type="button"
              aria-label={
                key === "backspace" ? ARIA_LABELS.backspace : undefined
              }
              onClick={() => calculator.press(key)}
              className={`h-12 rounded-md bg-surface font-num text-num-md select-none active:bg-line ${
                isOperatorKey(key) ? "text-accent" : "text-text01"
              }`}
            >
              {key === "backspace"
                ? CALCULATOR_TEXTS.backspaceKey
                : isOperatorKey(key)
                  ? SYMBOLS[key as keyof typeof SYMBOLS]
                  : key}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
};

export default CalculatorSheet;
