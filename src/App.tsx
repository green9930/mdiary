import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ExpendType, setExpend } from "./context/modules/expendSlice";
import { setUser } from "./context/modules/userSlice";
import { useAppSelector } from "./context/redux";
import { authService, dbService } from "./firebase";
import Router from "./router/Router";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    let username = "";
    const fetchUser = async () => {
      authService.onAuthStateChanged((user) => {
        if (user) {
          console.log(user);
          const { displayName, email, uid } = user;
          const userEmail = email ? email : "";
          username = displayName ? displayName : "";
          const userUid = uid ? uid : "";
          dispatch(
            setUser({ isLogin: true, email: userEmail, username, uid: userUid })
          );
          setIsLogin(true);
        } else setIsLogin(false);
      });
    };
    const fetchData = async () => {
      const q = query(collection(dbService, "expend"));
      const res = await getDocs(q);
      let arr: ExpendType[] = [];
      res.forEach((val) => {
        const data = val.data() as ExpendType;
        arr.push({ ...data, id: val.id });
      });
      dispatch(setExpend({ auth: username, arr }));
      setIsLoading(false);
    };

    fetchUser();
    fetchData();
  }, []);

  return (
    <>{isLoading ? <div>LOADING...</div> : <Router isLogin={isLogin} />}</>
  );
}

export default App;
