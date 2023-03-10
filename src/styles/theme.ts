import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  blue1: "#15B2D1",
  blue2: "#3A98B9",
  blue3: "#1D5171",
  blue4: "#17C3E6",
  beige1: "#FFF1DC",
  beige2: "#E8D5C4",
  beige3: "#F8F2ED",
  beige4: "#FFF1DC",
  red1: "#B90E0A",
  red2: "#FF0000",
  red3: "#d1452f",
  green1: "#00B418",
  green2: "#1BD4A2",
  gray1: "#FDFDFD",
  gray2: "#A6A6A6",
  gray3: "#EEEEEE",
  white: "#FFFFFF",
  black: "#0C0908",
};

export const calcRem = (size: number) => `${size / 14}rem`;
