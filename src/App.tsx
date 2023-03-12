import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authService } from "./firebase";
import Router from "./router/Router";
import { setExpend } from "./context/modules/expendSlice";
import { setUser } from "./context/modules/userSlice";
import Loader from "./components/elements/Loader";
import { fetchData } from "./utils/fetchData";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      authService.onAuthStateChanged((user) => {
        if (user) {
          console.log(user);
          const { displayName, email, uid } = user;
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
