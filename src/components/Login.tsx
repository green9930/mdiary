import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../context/modules/userSlice";
import { authService } from "../firebase";

const Login = () => {
  const dispatch = useDispatch();

  const provider = new GoogleAuthProvider();
  const handleSignIn = () =>
    signInWithPopup(authService, provider)
      .then((res) => {
        console.log("RESULT", res);
        const credential = GoogleAuthProvider.credentialFromResult(res);
        const token = credential?.accessToken;
        const { user } = res;
        if (user) {
          const email = user.email ? user.email : "";
          const username = user.displayName ? user.displayName : "";
          const uid = user.uid ? user.uid : "";
          dispatch(setUser({ isLogin: true, email, username, uid }));
        }
      })
      .catch((err) => {
        const errCode = err.code;
        const errMessage = err.message;
        console.log(err);
      });

  return (
    <div>
      <h2>LOGIN</h2>
      <div>
        <button onClick={handleSignIn}>Continue with Google</button>
      </div>
    </div>
  );
};

export default Login;
