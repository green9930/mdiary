import React from "react";
import styled from "styled-components";

import { calcRem, theme } from "../../styles/theme";

type btnTheme = "blue1" | "beige3" | "black";
type btnSize = "small1" | "small2";

interface IButton extends React.HTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  btnTheme: btnTheme;
  btnSize: btnSize;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<IButton> = ({
  onClick,
  type = "button",
  btnTheme,
  btnSize,
  children,
}) => {
  return (
    <StBtn type={type} onClick={onClick} btnTheme={btnTheme} btnSize={btnSize}>
      {children}
    </StBtn>
  );
};

export default Button;

const StBtn = styled.button<{ btnTheme: btnTheme; btnSize: btnSize }>`
  width: 100%;
  border: none;
  border-radius: ${calcRem(4)};
  background-color: ${({ btnTheme }) => {
    switch (btnTheme) {
      case "blue1":
        return `${theme.blue1}`;
      case "beige3":
        return `${theme.beige3}`;
      case "black":
        return `${theme.beige3}`;
      default:
        return `${theme.blue1}`;
    }
  }};
  color: ${({ btnTheme }) => {
    switch (btnTheme) {
      case "blue1":
        return `${theme.white}`;
      case "beige3":
        return `${theme.gray2}`;
      case "black":
        return `${theme.black}`;
      default:
        return `${theme.white}`;
    }
  }};
  padding: ${({ btnSize }) => {
    switch (btnSize) {
      case "small1":
        return `${calcRem(8)} ${calcRem(30)}`;
      case "small2":
        return `${calcRem(8)} ${calcRem(40)}`;
      default:
        return `${calcRem(8)} ${calcRem(40)}`;
    }
  }};
  font-size: ${({ btnSize }) => {
    switch (btnSize) {
      case "small1":
        return `${calcRem(14)}`;
      case "small2":
        return `${calcRem(14)}`;
      default:
        return `${calcRem(14)}`;
    }
  }};
  font-weight: 500;
`;
