type ClassValueType = string | false | null | undefined;

/** 클래스를 이어 붙인다. 거짓 값은 건너뛴다. 겹치는 클래스를 지우지 않으므로 같은 속성의 클래스가 함께 붙지 않게 조건을 나눈다 */
export const cn = (...classes: ClassValueType[]) =>
  classes.filter(Boolean).join(" ");
