import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {},
};

export const calcRem = (size: number) => `${size / 14}rem`;
