import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authService } from "./firebase";
import { updateProfile } from "firebase/auth";
import Router from "./router/Router";
import { setExpend } from "./context/modules/expendSlice";
import { setUser } from "./context/modules/userSlice";
import Loader from "./components/elements/Loader";
import { fetchData } from "./utils/fetchData";
import { TEST_ID, TEST_USERNAME } from "./config";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      authService.onAuthStateChanged((user) => {
        if (user) {
          const { displayName, email, uid } = user;
          // console.log(user);
          // if (email === TEST_ID)
          //   updateProfile(user, { displayName: TEST_USERNAME });
          const userEmail = email ? email : "";
          const username = displayName ? displayName : "";
          const userUid = uid ? uid : "";
          dispatch(
            setUser({ isLogin: true, email: userEmail, username, uid: userUid })
          );
          setIsLogin(true);
          fetchData(username)
            .then((res) => dispatch(setExpend(res)))
            .then(() => setIsLoading(false));
        } else {
          setIsLogin(false);
          setIsLoading(false);
        }
      });
    };

    fetchUser();
  }, []);

  return <>{isLoading ? <Loader /> : <Router isLogin={isLogin} />}</>;
}

export default App;
