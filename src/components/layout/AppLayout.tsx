import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { setUser } from "../../context/modules/userSlice";
import { useAppSelector } from "../../context/redux";
import { authService } from "../../firebase";
import { calcRem, theme } from "../../styles/theme";
import { ImPencil2 } from "react-icons/im";
import { VscSignOut } from "react-icons/vsc";

interface IAppLayout extends React.HTMLAttributes<HTMLDivElement> {}

const AppLayout: React.FC<IAppLayout> = ({ children }) => {
  const [target, setTarget] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLogin } = useAppSelector((state) => state.user);

  const onClick = async () => {
    await signOut(authService);
    dispatch(setUser({ isLogin: false, email: "", username: "", uid: "" }));
  };

  const handleNavigate = (name: string) => {
    setTarget(name);
    navigate(name);
  };

  return (
    <StAppLayout>
      <StNav>
        <StUser>
          <StLogo onClick={() => handleNavigate("/")}>
            <h1>다씀</h1>
            <ImPencil2 fill={`${theme.beige1}`} />
          </StLogo>
          {isLogin ? (
            <StSignOutBtn onClick={onClick} name="signout">
              <VscSignOut size={20} fill={`${theme.beige1}`} />
            </StSignOutBtn>
          ) : null}
        </StUser>
        <ul>
          <StLi isSelected={target === "/"} onClick={() => handleNavigate("/")}>
            MONTHLY
          </StLi>
          <StLi
            isSelected={target === "/weekly"}
            onClick={() => handleNavigate("/weekly")}
          >
            WEEKLY
          </StLi>
          <StLi
            isSelected={target === "/new"}
            onClick={() => handleNavigate("/new")}
          >
            NEW
          </StLi>
          <StLi
            isSelected={target === "/daily"}
            onClick={() => handleNavigate("/daily")}
          >
            DAILY
          </StLi>
          <StLi
            isSelected={target === "/categories"}
            onClick={() => handleNavigate("/categories")}
          >
            CATEGORY
          </StLi>
        </ul>
      </StNav>
      {children}
    </StAppLayout>
  );
};

export default AppLayout;

const StAppLayout = styled.div``;

const StNav = styled.nav`
  padding: ${calcRem(20)} ${calcRem(20)} ${calcRem(16)} ${calcRem(20)};
  background-color: ${theme.blue1};
  color: ${theme.white};
  position: relative;

  ul {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
`;

const StLi = styled.li<{ isSelected: boolean }>`
  color: ${({ isSelected }) => (isSelected ? theme.beige2 : theme.white)};
  font-family: "Rubik";
  font-size: ${calcRem(14)};
`;

const StLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${calcRem(14)};

  h1 {
    color: ${theme.beige1};
    font-family: "Tenada";
    font-size: ${calcRem(24)};
  }

  svg {
    color: ${theme.beige1};
  }
`;

const StUser = styled.div``;

const StSignOutBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${calcRem(2)};
  background-color: transparent;
  border: none;
  padding: ${calcRem(6)};
  position: absolute;
  top: ${calcRem(12)};
  right: ${calcRem(12)};
`;
