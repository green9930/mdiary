import { extendTailwindMerge } from "tailwind-merge";

// globals.css @theme의 이름을 알려 준다. 모르면 text-body(크기)를 글자 색으로 보고 text-text를 지운다
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "title-l",
        "title-m",
        "body-l",
        "body",
        "body-strong",
        "caption",
        "micro",
        "num-xl",
        "num-l",
        "num-m",
        "num-cal",
        "num-date",
        "button-l",
      ],
      shadow: ["1", "2", "sheet"],
      radius: ["sheet"],
    },
  },
});

type TClassValue = string | false | null | undefined;

/** 컴포넌트 기본 클래스와 바깥에서 넘긴 클래스를 합친다. 겹치면 뒤의 것이 이긴다 */
export const cn = (...classes: TClassValue[]) => twMerge(...classes);
