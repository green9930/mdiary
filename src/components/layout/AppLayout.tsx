import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import ReactGA from "react-ga4";
import styled from "styled-components";
import { VscGithubInverted, VscSignOut } from "react-icons/vsc";
import { ImPencil2 } from "react-icons/im";

import { authService } from "../../firebase";
import { setUser } from "../../context/modules/userSlice";
import { useAppSelector } from "../../context/redux";
import {
  MOBILE_MAX_W,
  TABLET_MAX_W,
  WINDOW_H,
  calcRem,
  theme,
} from "../../styles/theme";

interface IAppLayout extends React.HTMLAttributes<HTMLDivElement> {}

const AppLayout: React.FC<IAppLayout> = ({ children }) => {
  const [device, setDevice] = useState("");
  const [isPwa, setIsPwa] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isShow, setIsShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLogin } = useAppSelector((state) => state.user);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("iphone")) {
      setDevice("iphone");
      // window.matchMedia("(display-mode: standalone)").matches
      //   ? setIsPwa(true)
      //   : setIsPwa(false);
    } else if (userAgent.includes("android")) {
      setDevice("android");
    } else if (userAgent.includes("windows")) {
      setDevice("windows");
    } else if (userAgent.includes("mac")) {
      // iPad or mac
      setDevice("mac");
    }
    window.matchMedia("(display-mode: standalone)").matches
      ? setIsPwa(true)
      : setIsPwa(false);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsShow(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleNavigate = (name: string) => {
    // ReactGA.event({
    //   category: "Button",
    //   action: "Click",
    //   label: name,
    // });

    navigate(name);
  };

  const handleSignOut = async () => {
    await signOut(authService);
    dispatch(setUser({ isLogin: false, email: "", username: "", uid: "" }));
  };

  const handleInstall = async () => {
    // console.log("install APP");
    setIsShow(false);

    if (!deferredPrompt) {
      return;
    }
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    setDeferredPrompt(null);
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
              window.location.replace(
                process.env.NODE_ENV === "production"
                  ? process.env.PUBLIC_URL
                  : "/"
              )
            }
          >
            <h1>다씀</h1>
            <ImPencil2 fill={`${theme.beige1}`} />
          </StLogo>
          {/* {isPwa ? (
            <></>
          ) : (
            <>
              {isShow ? (
                <span>test...</span>
              ) : (
                <button onClick={() => handleInstall()}>{device}</button>
              )}
            </>
          )} */}
          {isLogin ? (
            <StSignOutBtn onClick={handleSignOut} name="signout">
              <VscSignOut size={`${calcRem(20)}`} fill={`${theme.beige1}`} />
            </StSignOutBtn>
          ) : null}
        </StUser>
        <ul>
          <StLi onClick={() => handleNavigate("/")}>MONTHLY</StLi>
          <StLi
            className="new-button"
            onClick={() => handleNavigate("/weekly")}
          >
            WEEKLY
          </StLi>
          <StLi className="new-button" onClick={() => handleNavigate("/new")}>
            NEW
          </StLi>
          <StLi onClick={() => handleNavigate("/daily")}>DAILY</StLi>
          <StLi onClick={() => handleNavigate("/categories")}>CATEGORY</StLi>
        </ul>
      </StNav>
      <StBody>{children}</StBody>
    </StAppLayout>
  );
};

export default AppLayout;

const StAppLayout = styled.div`
  max-width: ${MOBILE_MAX_W}px;
  min-height: ${calcRem(WINDOW_H)};
  margin: 0 auto;
  background-color: ${({ theme }) => theme.gray1};
  position: relative;

  @media screen and (max-width: ${TABLET_MAX_W}px) {
    width: 100%;
  }
`;

const StNav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: ${MOBILE_MAX_W}px;
  height: ${calcRem(100)};
  padding: ${calcRem(30)} ${calcRem(20)} ${calcRem(16)} ${calcRem(20)};
  position: fixed;
  background-color: ${theme.blue1};
  color: ${theme.white};
  z-index: 11;

  ul {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  @media screen and (max-width: ${MOBILE_MAX_W}px) {
    width: 100%;
  }
`;

const StLi = styled.li`
  color: ${theme.white};
  font-family: "Rubik";
  font-size: ${calcRem(14)};
`;

const StLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

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
  min-height: calc(100vh - ${calcRem(90)});
`;
