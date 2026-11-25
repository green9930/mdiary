import { countChars } from "@/lib/text";
import { CALCULATOR_RULES, EXPENSE_RULES } from "@/shared/expenseConstants";
import { CALCULATOR_ERRORS, CALCULATOR_TEXTS } from "@/shared/sharedConstants";
import type {
  CalculatorDigitType,
  CalculatorOperatorType,
  Rounding,
} from "@/types/expenseTypes";

// 계산기 식과 결과 (화면 명세 SC-07).
// 식은 숫자 문자열과 연산자를 번갈아 담은 배열이다 (`["36000", "/", "3"]`).
// 9자리 수를 여러 번 곱해도 정확하도록 분수(BigInt)로 계산한다

/** 분수. 분모는 늘 양수이고 약분돼 있다 */
interface Fraction {
  num: bigint;
  den: bigint;
}

/** 계산기 결과 미리보기와 [적용] */
interface CalculatorResult {
  /** 식에 나누기가 있는지 (끝전 처리 선택을 보일지) */
  hasDivision: boolean;
  /** 식이 숫자로 끝나는지. 연산자로 끝나면 직전까지 계산한 값을 흐리게 보여 준다 */
  complete: boolean;
  /** 끝전 처리 전 값 (`33,333.33`). 나누기가 있고 결과와 다를 때만 */
  exact: string | null;
  /** 끝전 처리한 결과 (`33,340`). 빈 식·0으로 나눔·최대 금액 초과면 없다 */
  value: string | null;
  /** [적용]으로 금액 칸에 넣을 값. 적용할 수 없으면 null */
  amount: number | null;
  /** [적용]할 수 없는 이유 문구 */
  error: string | null;
  /** 내용에 덧붙일 계산식 한 줄 (`36,000 ÷ 3 = 12,000`) */
  formula: string | null;
}

const DEFAULT_ROUNDING: Rounding = {
  unit: CALCULATOR_RULES.roundingUnits[0],
  direction: "down",
};

const isOperator = (token: string | undefined) =>
  token !== undefined && token in CALCULATOR_RULES.operatorSymbols;

/** 금액 칸 값으로 식을 시작한다. 비어 있으면 빈 식 */
export const startExpression = (amount: string): string[] =>
  amount ? [String(Number(amount))] : [];

/** 숫자 키(`0`~`9`, `00`). 9자리를 넘기지 않고, 앞자리 0은 두지 않는다 */
export const inputDigit = (
  tokens: string[],
  key: CalculatorDigitType,
): string[] => {
  const last = tokens.at(-1);
  if (last === undefined || isOperator(last)) {
    return [...tokens, key === "00" ? "0" : key];
  }
  const head = tokens.slice(0, -1);
  if (last === "0") return key === "00" ? tokens : [...head, key];
  const room = EXPENSE_RULES.amountDigits - last.length;
  return room > 0 ? [...head, last + key.slice(0, room)] : tokens;
};

/** 연산자 키. 맨 앞에는 넣지 않고, 연달아 누르면 바꾸고, 최대 개수를 넘기지 않는다 */
export const inputOperator = (
  tokens: string[],
  operator: CalculatorOperatorType,
): string[] => {
  const last = tokens.at(-1);
  if (last === undefined) return tokens;
  if (isOperator(last)) return [...tokens.slice(0, -1), operator];
  const count = tokens.filter(isOperator).length;
  return count < CALCULATOR_RULES.operatorMax ? [...tokens, operator] : tokens;
};

/** ← 키: 마지막 한 글자(연산자는 하나)를 지운다 */
export const deleteLast = (tokens: string[]): string[] => {
  const last = tokens.at(-1);
  if (last === undefined) return tokens;
  const head = tokens.slice(0, -1);
  return isOperator(last) || last.length === 1
    ? head
    : [...head, last.slice(0, -1)];
};

const formatInteger = (value: bigint) =>
  value < ZERO
    ? `${CALCULATOR_RULES.operatorSymbols["-"]}${(-value).toLocaleString("ko-KR")}`
    : value.toLocaleString("ko-KR");

/** 식 표시줄: 쉼표와 화면 기호 (`36,000 ÷ 3`) */
export const formatExpression = (tokens: string[]) =>
  tokens
    .map((token) =>
      isOperator(token)
        ? CALCULATOR_RULES.operatorSymbols[token as CalculatorOperatorType]
        : formatInteger(BigInt(token)),
    )
    .join(" ");

// target(ES2017)에서는 0n 리터럴을 쓸 수 없어 BigInt()로 상수 만듦
const ZERO = BigInt(0);
const ONE = BigInt(1);

const gcd = (a: bigint, b: bigint): bigint => (b === ZERO ? a : gcd(b, a % b));

const fraction = (num: bigint, den: bigint): Fraction => {
  const sign = den < ZERO ? -ONE : ONE;
  const divisor = gcd(num < ZERO ? -num : num, den < ZERO ? -den : den) || ONE;
  return { num: (sign * num) / divisor, den: (sign * den) / divisor };
};

const OPERATIONS: Record<
  CalculatorOperatorType,
  (a: Fraction, b: Fraction) => Fraction
> = {
  "+": (a, b) => fraction(a.num * b.den + b.num * a.den, a.den * b.den),
  "-": (a, b) => fraction(a.num * b.den - b.num * a.den, a.den * b.den),
  "*": (a, b) => fraction(a.num * b.num, a.den * b.den),
  "/": (a, b) => fraction(a.num * b.den, a.den * b.num),
};

/**
 * 곱하기·나누기를 먼저, 같은 순위는 왼쪽부터 계산한다.
 * 0으로 나누면 "divideByZero", 빈 식이면 null
 */
const evaluate = (tokens: string[]): Fraction | "divideByZero" | null => {
  let sum: Fraction | null = null;
  let sign: CalculatorOperatorType = "+";
  let term: Fraction | null = null;
  let pending: CalculatorOperatorType = "+";
  for (const token of tokens) {
    if (isOperator(token)) {
      pending = token as CalculatorOperatorType;
      continue;
    }
    const operand = fraction(BigInt(token), ONE);
    if (term === null) {
      term = operand;
    } else if (pending === "*" || pending === "/") {
      if (pending === "/" && operand.num === ZERO) return "divideByZero";
      term = OPERATIONS[pending](term, operand);
    } else {
      sum = sum ? OPERATIONS[sign](sum, term) : term;
      sign = pending;
      term = operand;
    }
  }
  return sum && term ? OPERATIONS[sign](sum, term) : term;
};

// 바닥·천장 나눗셈 (BigInt 나눗셈은 0 쪽으로 버린다)
const floorDiv = (a: bigint, b: bigint) => {
  const q = a / b;
  return a % b !== ZERO && a < ZERO !== b < ZERO ? q - ONE : q;
};

const ceilDiv = (a: bigint, b: bigint) => -floorDiv(-a, b);

/** 끝전 처리: 단위로 올림·버림한 정수 */
const roundFraction = (value: Fraction, { unit, direction }: Rounding) => {
  const den = value.den * BigInt(unit);
  const units =
    direction === "up" ? ceilDiv(value.num, den) : floorDiv(value.num, den);
  return units * BigInt(unit);
};

const DECIMALS = BigInt(100);

/** 끝전 처리 전 값: 소수 둘째 자리까지 버리고, 끝 0은 뺀다 (`33,333.33`, `2.5`) */
const formatExact = (value: Fraction) => {
  const negative = value.num < ZERO;
  const scaled = ((negative ? -value.num : value.num) * DECIMALS) / value.den;
  const integer = formatInteger(
    negative ? -(scaled / DECIMALS) : scaled / DECIMALS,
  );
  const decimals = String(scaled % DECIMALS)
    .padStart(2, "0")
    .replace(/0+$/, "");
  return decimals ? `${integer}.${decimals}` : integer;
};

const isDefaultRounding = ({ unit, direction }: Rounding) =>
  unit === DEFAULT_ROUNDING.unit && direction === DEFAULT_ROUNDING.direction;

/** 식과 끝전 처리 선택으로 결과 미리보기·[적용] 값·이유·계산식을 만든다 */
export const convertCalculatorResult = (
  tokens: string[],
  rounding: Rounding,
): CalculatorResult => {
  const hasDivision = tokens.includes("/");
  const complete = !isOperator(tokens.at(-1));
  const empty: CalculatorResult = {
    hasDivision,
    complete,
    exact: null,
    value: null,
    amount: null,
    error: null,
    formula: null,
  };

  const evaluated = evaluate(complete ? tokens : tokens.slice(0, -1));
  if (evaluated === null) return empty;
  if (evaluated === "divideByZero")
    return { ...empty, error: CALCULATOR_ERRORS.divideByZero };

  const applied = hasDivision ? rounding : DEFAULT_ROUNDING;
  const rounded = roundFraction(evaluated, applied);
  const changed = evaluated.den !== ONE || evaluated.num !== rounded;
  const exact = hasDivision && changed ? formatExact(evaluated) : null;

  // 최대 금액보다 크면(음수 쪽도) 값이 너무 길어 보여 주지 않는다
  const max = BigInt(EXPENSE_RULES.amountMax);
  if (rounded > max || rounded < -max) {
    const error =
      rounded > max ? CALCULATOR_ERRORS.overMax : CALCULATOR_ERRORS.belowMin;
    return { ...empty, error: complete ? error : null };
  }

  const value = formatInteger(rounded);
  if (!complete) return { ...empty, exact, value };
  if (rounded < BigInt(EXPENSE_RULES.amountMin))
    return { ...empty, exact, value, error: CALCULATOR_ERRORS.belowMin };

  // 기본값(1원 버림)이 아니고 끝전 처리로 값이 바뀐 때만 표시한다
  const note =
    isDefaultRounding(applied) || !changed
      ? ""
      : ` ${CALCULATOR_TEXTS.roundingNote(applied.unit, applied.direction === "up")}`;
  return {
    ...empty,
    exact,
    value,
    amount: Number(rounded),
    formula: `${formatExpression(tokens)} = ${value}${note}`,
  };
};

/** 지출 내용 뒤에 계산식 이어 붙이기 */
export const appendFormulaToContent = (content: string, formula: string) => {
  const next = content ? `${content}\n${formula}` : formula;
  return countChars(next) > EXPENSE_RULES.contentMax ? null : next;
};
