import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  blue1: "#15B2D1",
  blue2: "#3A98B9",
  blue3: "#1D5171",
  blue4: "#8AD8E8",
  beige1: "#FFF1DC",
  beige2: "#E8D5C4",
  beige3: "#F8F2ED",
  red1: "#B90E0A",
  red2: "#FF0000",
  green1: "#00B418",
  gray1: "#FDFDFD",
  gray2: "#A6A6A6",
  gray3: "#EEEEEE",
  white: "#FFFFFF",
  black: "#0C0908",
};

export const calcRem = (size: number) => `${size / 14}rem`;
