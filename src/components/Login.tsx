import { useDispatch } from "react-redux";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { authService } from "../firebase";
import styled from "styled-components";
import { setUser } from "../context/modules/userSlice";
import { setExpend } from "../context/modules/expendSlice";
import { fetchData } from "../utils/fetchData";
import { calcRem, theme } from "../styles/theme";
import { FcGoogle, FcUnlock } from "react-icons/fc";
import { ImPencil2 } from "react-icons/im";
import { GoLinkExternal } from "react-icons/go";
import { TEST_ID, TEST_USERNAME } from "../config";

const Login = () => {
  const dispatch = useDispatch();

  const provider = new GoogleAuthProvider();
  let username: string = "";

  const handleSignIn = () =>
    signInWithPopup(authService, provider)
      .then((res) => {
        const credential = GoogleAuthProvider.credentialFromResult(res);
        const token = credential?.accessToken;
        const { user } = res;
        if (user) {
          const email = user.email ? user.email : "";
          username = user.displayName ? user.displayName : "";
          const uid = user.uid ? user.uid : "";
          dispatch(setUser({ isLogin: true, email, username, uid }));
        }
      })
      .then(() => fetchData(username).then((res) => dispatch(setExpend(res))))
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.message;
        console.error(err);
      });

  const handleTestSignIn = async () =>
    await signInWithEmailAndPassword(
      authService,
      TEST_ID as string,
      process.env.REACT_APP_ADMIN_PASSWORD as string
    )
      .then(() => {
        username = TEST_USERNAME;
        dispatch(
          setUser({
            isLogin: true,
            email: TEST_ID,
            username,
            uid: "testuser",
          })
        );
      })
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.message;
        console.error(err);
      });

  return (
    <StLogin>
      <p>내가 얼마 썼는지"만" 알고 싶을 때, </p>
      <StLogo>
        <h2>다씀</h2>
        <ImPencil2 size={`${calcRem(26)}`} fill={`${theme.blue4}`} />
      </StLogo>
      <StGoogleLogin onClick={handleSignIn}>
        <FcGoogle size={`${calcRem(16)}`} />
        <span>Continue with Google</span>
      </StGoogleLogin>
      <a href="https://github.com/green9930/mdiary" target="_blank">
        <span>서비스 자세히 알아보기</span>
        <GoLinkExternal size={`${calcRem(12)}`} fill={`${theme.blue3}`} />
      </a>
      <StTestLogin onClick={handleTestSignIn}>
        <FcUnlock size={`${calcRem(20)}`} />
        <span>체험해보기</span>
      </StTestLogin>
    </StLogin>
  );
};

export default Login;

const StLogin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-top: ${calcRem(100)};

  p {
    margin-bottom: ${calcRem(24)};
    padding: ${calcRem(10)};
    border-radius: ${calcRem(6)};
    color: ${theme.green2};
    font-family: "KorailRoundGothicBold";
  }
  a {
    display: flex;
    align-items: center;
    gap: ${calcRem(4)};
    span {
      color: ${theme.blue3};
      font-weight: 500;
    }
  }
`;

const StLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${calcRem(70)};

  h2 {
    color: ${theme.blue4};
    font-family: "Tenada";
    font-size: ${calcRem(48)};
  }
`;

const StGoogleLogin = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(6)};
  margin-bottom: ${calcRem(24)};
  padding: ${calcRem(10)};
  border: none;
  border-radius: ${calcRem(4)};
  background-color: ${theme.beige3};

  span {
    font-size: ${calcRem(16)};
    font-weight: 500;
  }
`;

const StTestLogin = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${calcRem(6)};
  width: ${calcRem(130)};
  margin-top: ${calcRem(10)};
  padding: ${calcRem(6)} ${calcRem(12)};
  background-color: ${theme.gray3};
  border: none;
  border-radius: ${calcRem(4)};

  span {
    flex-grow: 1;
    color: ${theme.gray2};
    font-size: ${calcRem(12)};
    font-weight: 500;
  }
`;
