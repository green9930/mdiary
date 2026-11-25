import { describe, expect, it } from "vitest";

import {
  appendFormulaToContent,
  convertCalculatorResult,
  deleteLast,
  formatExpression,
  inputDigit,
  inputOperator,
  startExpression,
} from "@/lib/calculatorUtils";
import { CALCULATOR_ERRORS, CALCULATOR_TEXTS } from "@/shared/sharedConstants";
import type {
  CalculatorDigitType,
  CalculatorOperatorType,
  Rounding,
} from "@/types/expenseTypes";

const DEFAULT: Rounding = { unit: 1, direction: "down" };

/** 키를 차례로 누른 식. 여러 자리 숫자는 한 글자씩 누른다 (`00`은 키 하나) */
const press = (keys: string[], start: string[] = []) =>
  keys.reduce((tokens, key) => {
    if (key === "00") return inputDigit(tokens, key);
    if (/^\d+$/.test(key))
      return [...key].reduce(
        (prev, digit) => inputDigit(prev, digit as CalculatorDigitType),
        tokens,
      );
    return inputOperator(tokens, key as CalculatorOperatorType);
  }, start);

describe("startExpression (화면 명세 SC-07: 금액 값을 첫 숫자로)", () => {
  it("금액이 있으면 그 값으로 시작한다", () => {
    expect(startExpression("36000")).toEqual(["36000"]);
  });

  it("금액이 비어 있으면 빈 식이다", () => {
    expect(startExpression("")).toEqual([]);
  });
});

describe("inputDigit (숫자 하나 최대 9자리, 앞자리 0)", () => {
  it("숫자를 이어 붙인다", () => {
    expect(press(["1", "2", "3"])).toEqual(["123"]);
  });

  it("연산자 뒤에서는 새 숫자를 시작한다", () => {
    expect(press(["1", "+", "2"])).toEqual(["1", "+", "2"]);
  });

  it("9자리에서는 더 받지 않는다", () => {
    expect(inputDigit(["123456789"], "1")).toEqual(["123456789"]);
  });

  it("00은 남은 자리만큼만 붙인다", () => {
    expect(inputDigit(["1234567"], "00")).toEqual(["123456700"]);
    expect(inputDigit(["12345678"], "00")).toEqual(["123456780"]);
  });

  it("숫자가 0이면 다른 숫자로 바꾼다", () => {
    expect(press(["0", "7"])).toEqual(["7"]);
  });

  it("숫자를 00으로 시작하면 0 하나만 넣는다", () => {
    expect(press(["00"])).toEqual(["0"]);
    expect(press(["0", "00"])).toEqual(["0"]);
    expect(press(["5", "+", "00"])).toEqual(["5", "+", "0"]);
  });
});

describe("inputOperator (연산자 최대 10개, 연달아 누르면 바꾸기, 맨 앞 불가)", () => {
  it("식 맨 앞에는 넣지 않는다", () => {
    expect(inputOperator([], "-")).toEqual([]);
  });

  it("연달아 누르면 마지막 것으로 바꾼다", () => {
    expect(press(["5", "+", "*"])).toEqual(["5", "*"]);
  });

  it("10개가 차면 더 받지 않는다", () => {
    const ten = press(Array.from({ length: 10 }, () => ["1", "+"]).flat());
    expect(press(["1", "+"], ten)).toEqual([...ten, "1"]);
  });

  it("10개가 찼어도 마지막 연산자는 바꿀 수 있다", () => {
    const ten = press(Array.from({ length: 10 }, () => ["1", "+"]).flat());
    expect(inputOperator(ten, "-").at(-1)).toBe("-");
  });
});

describe("deleteLast (← 한 글자 지우기)", () => {
  it("숫자의 마지막 글자를 지운다", () => {
    expect(deleteLast(["36000"])).toEqual(["3600"]);
  });

  it("한 자리 숫자는 통째로 지운다", () => {
    expect(deleteLast(["5", "+", "3"])).toEqual(["5", "+"]);
  });

  it("마지막이 연산자면 연산자를 지운다", () => {
    expect(deleteLast(["5", "+"])).toEqual(["5"]);
  });

  it("빈 식은 그대로다", () => {
    expect(deleteLast([])).toEqual([]);
  });
});

describe("formatExpression (식 표시줄)", () => {
  it("쉼표와 화면 기호로 보여 준다", () => {
    expect(formatExpression(["36000", "/", "3", "*", "2", "-", "1"])).toBe(
      "36,000 ÷ 3 × 2 − 1",
    );
  });

  it("끝의 연산자도 보여 준다", () => {
    expect(formatExpression(["36000", "+"])).toBe("36,000 +");
  });
});

describe("convertCalculatorResult: 계산", () => {
  it("빈 식은 결과가 없고 적용할 수 없다", () => {
    const result = convertCalculatorResult([], DEFAULT);
    expect(result.value).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.error).toBeNull();
  });

  it("곱하기·나누기를 먼저 계산한다", () => {
    const result = convertCalculatorResult(
      press(["2", "+", "3", "*", "4"]),
      DEFAULT,
    );
    expect(result.value).toBe("14");
    expect(result.amount).toBe(14);
  });

  it("왼쪽부터 같은 순위끼리 계산한다", () => {
    expect(
      convertCalculatorResult(press(["10", "-", "3", "-", "2"]), DEFAULT)
        .amount,
    ).toBe(5);
    expect(
      convertCalculatorResult(press(["100", "/", "5", "*", "2"]), DEFAULT)
        .amount,
    ).toBe(40);
  });

  it("9자리 수를 여러 번 곱해도 정확히 계산한다 (범위 밖이면 적용 불가)", () => {
    const tokens = press([
      "999999999",
      "*",
      "999999999",
      "*",
      "999999999",
      "/",
      "999999999",
      "/",
      "999999999",
    ]);
    expect(convertCalculatorResult(tokens, DEFAULT).amount).toBe(999_999_999);
  });

  it("숫자 하나뿐인 식도 결과다", () => {
    expect(convertCalculatorResult(["36000"], DEFAULT).amount).toBe(36000);
  });
});

describe("convertCalculatorResult: 식이 연산자로 끝날 때", () => {
  it("직전까지 계산한 값을 흐리게 보여 주고 적용할 수 없다", () => {
    const result = convertCalculatorResult(
      press(["5", "+", "3", "*"]),
      DEFAULT,
    );
    expect(result.value).toBe("8");
    expect(result.complete).toBe(false);
    expect(result.amount).toBeNull();
    expect(result.error).toBeNull();
  });
});

describe("convertCalculatorResult: 끝전 처리", () => {
  const third = press(["100000", "/", "3"]);

  it("나누기가 있으면 처리 전 값을 소수 둘째 자리까지(버림) 보여 준다", () => {
    const result = convertCalculatorResult(third, DEFAULT);
    expect(result.exact).toBe("33,333.33");
    expect(result.value).toBe("33,333");
    expect(result.amount).toBe(33333);
  });

  it("처리 전 값이 결과와 같으면 따로 보여 주지 않는다", () => {
    expect(
      convertCalculatorResult(press(["36000", "/", "3"]), DEFAULT).exact,
    ).toBeNull();
  });

  it("처리 전 값의 소수 끝 0은 뺀다", () => {
    expect(
      convertCalculatorResult(press(["10", "/", "4"]), DEFAULT).exact,
    ).toBe("2.5");
  });

  it("단위와 방향을 결과에 적용한다", () => {
    expect(
      convertCalculatorResult(third, { unit: 10, direction: "up" }).amount,
    ).toBe(33340);
    expect(
      convertCalculatorResult(third, { unit: 100, direction: "down" }).amount,
    ).toBe(33300);
    expect(
      convertCalculatorResult(third, { unit: 1, direction: "up" }).amount,
    ).toBe(33334);
  });

  it("나누어떨어져도 단위를 적용한다", () => {
    expect(
      convertCalculatorResult(press(["12345", "/", "1"]), {
        unit: 100,
        direction: "up",
      }).amount,
    ).toBe(12400);
  });

  it("나누기가 없으면 끝전 처리를 하지 않는다", () => {
    const result = convertCalculatorResult(press(["12345", "+", "1"]), {
      unit: 100,
      direction: "up",
    });
    expect(result.hasDivision).toBe(false);
    expect(result.amount).toBe(12346);
  });

  it("범위 검사는 처리 후 값으로 한다", () => {
    const half = press(["1", "/", "2"]);
    expect(convertCalculatorResult(half, DEFAULT).error).toBe(
      CALCULATOR_ERRORS.belowMin,
    );
    expect(
      convertCalculatorResult(half, { unit: 1, direction: "up" }).amount,
    ).toBe(1);
  });
});

describe("convertCalculatorResult: 적용할 수 없는 결과", () => {
  it("1원 미만: 결과는 보여 주고 이유를 알린다", () => {
    const result = convertCalculatorResult(
      press(["5000", "-", "8000"]),
      DEFAULT,
    );
    expect(result.value).toBe("−3,000");
    expect(result.amount).toBeNull();
    expect(result.error).toBe(CALCULATOR_ERRORS.belowMin);
  });

  it("0원도 1원 미만이다", () => {
    expect(convertCalculatorResult(press(["5", "-", "5"]), DEFAULT).error).toBe(
      CALCULATOR_ERRORS.belowMin,
    );
  });

  it("최대 금액 초과: 결과 없이 이유만 알린다", () => {
    const result = convertCalculatorResult(
      press(["999999999", "+", "1"]),
      DEFAULT,
    );
    expect(result.value).toBeNull();
    expect(result.error).toBe(CALCULATOR_ERRORS.overMax);
  });

  it("0으로 나눔: 결과 없이 이유만 알린다", () => {
    const result = convertCalculatorResult(press(["36000", "/", "0"]), DEFAULT);
    expect(result.value).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.error).toBe(CALCULATOR_ERRORS.divideByZero);
  });

  it("식이 덜 끝나도 0으로 나눈 것은 알린다", () => {
    expect(
      convertCalculatorResult(press(["36000", "/", "0", "+"]), DEFAULT).error,
    ).toBe(CALCULATOR_ERRORS.divideByZero);
  });

  it("뒤에 0으로 나누는 항이 있으면 앞 결과와 상관없이 알린다", () => {
    expect(
      convertCalculatorResult(press(["5", "+", "1", "/", "0"]), DEFAULT).error,
    ).toBe(CALCULATOR_ERRORS.divideByZero);
  });
});

describe("convertCalculatorResult: 내용에 남길 계산식", () => {
  it("`식 = 결과` 한 줄이다", () => {
    expect(
      convertCalculatorResult(press(["36000", "/", "3"]), DEFAULT).formula,
    ).toBe("36,000 ÷ 3 = 12,000");
  });

  it("기본값이 아닌 끝전 처리를 했으면 덧붙인다", () => {
    expect(
      convertCalculatorResult(press(["100000", "/", "3"]), {
        unit: 10,
        direction: "up",
      }).formula,
    ).toBe(`100,000 ÷ 3 = 33,340 ${CALCULATOR_TEXTS.roundingNote(10, true)}`);
    expect(
      convertCalculatorResult(press(["100000", "/", "3"]), {
        unit: 1,
        direction: "up",
      }).formula,
    ).toBe(`100,000 ÷ 3 = 33,334 ${CALCULATOR_TEXTS.roundingNote(1, true)}`);
  });

  it("끝전 처리로 값이 바뀌지 않았으면 덧붙이지 않는다", () => {
    expect(
      convertCalculatorResult(press(["36000", "/", "3"]), {
        unit: 10,
        direction: "up",
      }).formula,
    ).toBe("36,000 ÷ 3 = 12,000");
  });

  it("적용할 수 없으면 계산식도 없다", () => {
    expect(
      convertCalculatorResult(press(["5", "+"]), DEFAULT).formula,
    ).toBeNull();
    expect(
      convertCalculatorResult(press(["5", "-", "8"]), DEFAULT).formula,
    ).toBeNull();
  });
});

describe("appendFormulaToContent (내용 끝에 새 줄로, 200자 초과면 기록하지 않음)", () => {
  it("내용이 비어 있으면 첫 줄이다", () => {
    expect(appendFormulaToContent("", "1 + 1 = 2")).toBe("1 + 1 = 2");
  });

  it("내용 끝에 새 줄로 붙인다", () => {
    expect(appendFormulaToContent("점심\n1 + 1 = 2", "2 + 2 = 4")).toBe(
      "점심\n1 + 1 = 2\n2 + 2 = 4",
    );
  });

  it("붙이면 200자를 넘을 때는 null이다", () => {
    const formula = "1 + 1 = 2";
    const fits = "가".repeat(200 - formula.length - 1);
    expect(appendFormulaToContent(fits, formula)).toHaveLength(200);
    expect(appendFormulaToContent(`${fits}가`, formula)).toBeNull();
  });
});
