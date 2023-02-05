import { signOut } from "firebase/auth";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { setUser } from "../../context/modules/userSlice";
import { useAppSelector } from "../../context/redux";
import { authService } from "../../firebase";

interface IAppLayout extends React.HTMLAttributes<HTMLDivElement> {}

const AppLayout: React.FC<IAppLayout> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLogin, email, username, uid } = useAppSelector(
    (state) => state.user
  );

  const onClick = async () => {
    await signOut(authService);
    dispatch(setUser({ isLogin: false, email: "", username: "", uid: "" }));
  };

  const handleNavigate = (name: string) => navigate(name);

  return (
    <StAppLayout>
      <h1>MDIARY</h1>
      <StNav>
        <StUser>
          {isLogin ? (
            <div>
              <span>Hello, </span>
              <span>{username}</span>
              <button onClick={onClick}>SIGN OUT</button>
            </div>
          ) : null}
        </StUser>
        <ul>
          <li onClick={() => handleNavigate("/")}>MONTHLY</li>
          <li onClick={() => handleNavigate("/weekly")}>WEEKLY</li>
          <li onClick={() => handleNavigate("/new")}>NEW</li>
          <li onClick={() => handleNavigate("/daily")}>DAILY</li>
          <li onClick={() => handleNavigate("/categories")}>CATEGORY</li>
        </ul>
      </StNav>
      {children}
    </StAppLayout>
  );
};

export default AppLayout;

const StAppLayout = styled.div``;

const StNav = styled.nav`
  ul {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
`;

const StUser = styled.div``;
