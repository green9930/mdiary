import { browserSessionPersistence, setPersistence } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./context/modules/userSlice";
import { useAppSelector } from "./context/redux";
import { authService, dbService } from "./firebase";
import Router from "./router/Router";

function App() {
  const [isLoading, setIsLoading] = useState(false);
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
        } else setIsLogin(false);
        setIsLoading(true);
      });
    };
    fetchUser();
  }, []);

  return (
    <>{isLoading ? <Router isLogin={isLogin} /> : <div>LOADING...</div>}</>
  );
}

export default App;
