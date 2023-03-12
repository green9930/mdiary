import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import styled from "styled-components";
import { setUser } from "../../context/modules/userSlice";
import { useAppSelector } from "../../context/redux";
import { authService } from "../../firebase";
import { calcRem, theme } from "../../styles/theme";
import { ImPencil2 } from "react-icons/im";
import { VscGithubInverted, VscSignOut } from "react-icons/vsc";

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
        <StCopyright>
          <span>Made by</span>
          <StGithub href="https://github.com/green9930" target="_blank">
            <VscGithubInverted
              size={`${calcRem(10)}`}
              fill={`${theme.beige1}`}
            />
            <span>green9930</span>
          </StGithub>
        </StCopyright>
        <StUser>
          <StLogo
            onClick={() =>
              (window.location.href =
                process.env.NODE_ENV === "production"
                  ? process.env.PUBLIC_URL
                  : "")
            }
          >
            <h1>다씀</h1>
            <ImPencil2 fill={`${theme.beige1}`} />
          </StLogo>
          {isLogin ? (
            <StSignOutBtn onClick={onClick} name="signout">
              <VscSignOut size={`${calcRem(20)}`} fill={`${theme.beige1}`} />
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
      <StBody>{children}</StBody>
      <StFooter>
        <p>Copyright © 2023 Bae Geuna. All rights reserved.</p>
        <StGithub href="https://github.com/green9930" target="_blank">
          <VscGithubInverted size={`${calcRem(10)}`} fill={`${theme.beige1}`} />
          <span>green9930</span>
        </StGithub>
      </StFooter>
    </StAppLayout>
  );
};

export default AppLayout;

const StAppLayout = styled.div`
  min-height: 100vh;
`;

const StNav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${calcRem(100)};
  padding: ${calcRem(30)} ${calcRem(20)} ${calcRem(16)} ${calcRem(20)};
  position: relative;
  background-color: ${theme.blue1};
  color: ${theme.white};

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

const StCopyright = styled.div`
  display: flex;
  gap: ${calcRem(6)};
  position: absolute;
  top: ${calcRem(6)};
  left: ${calcRem(6)};

  span {
    color: ${theme.beige1};
    font-size: ${calcRem(10)};
  }
`;

const StGithub = styled.a`
  display: flex;
  align-items: center;
  gap: ${calcRem(2)};
  span {
    font-weight: 500;
  }
`;

const StBody = styled.div`
  padding-bottom: ${calcRem(50)};
  min-height: calc(100vh - ${calcRem(100)});
`;

const StFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${theme.blue1};
  width: 100%;
  height: ${calcRem(90)};
  padding-bottom: ${calcRem(20)};

  p,
  span {
    color: ${theme.beige1};
    font-size: ${calcRem(12)};
  }
  p {
    text-align: center;
  }
`;
